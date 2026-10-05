/* Shared behaviour: theme, copy buttons, reveal-on-scroll, the pixel field. No dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  var WB = (window.WB = window.WB || {});

  WB.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  WB.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  WB.theme = function () { return root.dataset.theme === 'dark' ? 'dark' : 'light'; };

  /* ---------- theme toggle ---------- */
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = WB.theme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('wb-theme', next); } catch (e) {}
      b.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      window.dispatchEvent(new Event('themechange'));
    });
    b.setAttribute('aria-label', WB.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });

  /* ---------- copy ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.querySelector(btn.getAttribute('data-copy'));
      if (!el) return;
      var text = el.textContent.trim();
      var done = function () {
        btn.classList.add('copied');
        setTimeout(function () { btn.classList.remove('copied'); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else fallback(text, done);
    });
  });
  function fallback(text, done) {
    var t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(t);
  }

  /* ---------- reveal ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && rv.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(function (n) { io.observe(n); });
  } else rv.forEach(function (n) { n.classList.add('in'); });

  /* ---------- the pixel field (hero art) ----------
     The mark is three bars of 8 rows, two pixels wide, stepping one column left every two rows.
     The field is the same pixel grid as the app's activity strips: empty cells are inset trays,
     the pointer is an agent working through them. */
  var RAMPS = {
    light: {
      ink: ['#3A3A38', '#333331', '#2C2C2B', '#252524', '#1F1F1E', '#181817', '#111111', '#0A0A0A'],
      co: ['#5B7BFF', '#5272FC', '#4A6AF9', '#4161F6', '#3959F3', '#3050F0', '#2848ED', '#1F3FEA'],
      am: ['#FFCB6B', '#FCC35E', '#F8BB51', '#F5B344', '#F2AA36', '#EFA229', '#EB9A1C', '#E8920F']
    },
    dark: {
      ink: ['#FFFFFF', '#F7F7F6', '#EEEEEC', '#E6E6E3', '#DDDDDA', '#D5D5D1', '#CCCCC7', '#C4C4BE'],
      co: ['#A3B4FF', '#99ACFF', '#8EA4FF', '#849CFF', '#7A93FF', '#708BFF', '#6583FF', '#5B7BFF'],
      am: ['#FFCB6B', '#FCC35E', '#F8BB51', '#F5B344', '#F2AA36', '#EFA229', '#EB9A1C', '#E8920F']
    }
  };
  var MARK = [];
  ['ink', 'co', 'am'].forEach(function (name, bar) {
    for (var r = 0; r < 8; r++) {
      var c0 = 3 - Math.floor(r / 2);
      for (var k = 0; k < 2; k++) MARK.push({ c: bar * 3 + c0 + k, r: r, bar: name, i: bar });
    }
  });

  WB.pixelField = function (canvas) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, pitch = 28, cols = 0, rows = 0, mc = 0, mr = 0;
    var heat, kind, running = false, visible = true, t0 = performance.now(), last = 0, raf = 0;
    var cs = {};
    function readColors() {
      var s = getComputedStyle(root);
      cs = { s2: s.getPropertyValue('--s2').trim(), ac: s.getPropertyValue('--ac').trim(), am: s.getPropertyValue('--amber').trim(), bd: s.getPropertyValue('--bd').trim(), th: WB.theme() };
    }
    function size() {
      var r = canvas.getBoundingClientRect();
      W = Math.max(280, r.width); H = r.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      pitch = W < 420 ? 20 : W < 560 ? 26 : 30;
      cols = Math.floor(W / pitch); rows = Math.floor(H / pitch);
      mc = Math.floor((cols - 11) / 2) + 1; mr = Math.floor((rows - 8) / 2);
      heat = new Float32Array(cols * rows); kind = new Uint8Array(cols * rows);
      draw(performance.now());
    }
    function warm(c, r, amt, k) {
      if (c < 0 || r < 0 || c >= cols || r >= rows) return;
      var i = r * cols + c;
      if (amt > heat[i]) { heat[i] = amt; kind[i] = k; }
    }
    function burst(px, py, k) {
      var c = Math.floor(px / pitch), r = Math.floor(py / pitch);
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d <= 2.3) warm(c + dx, r + dy, 1 - d / 3, k);
      }
      kick();
    }
    function draw(now) {
      if (!cols) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var cell = pitch - 4, ox = (W - cols * pitch) / 2 + 2, oy = (H - rows * pitch) / 2 + 2;
      var t = now - t0, intro = WB.reduced ? 1e6 : t;
      var mi = {};
      MARK.forEach(function (m) { mi[(m.r + mr) * cols + (m.c + mc)] = m; });
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var i = r * cols + c, x = ox + c * pitch, y = oy + r * pitch, m = mi[i], h = heat[i];
        // tray
        ctx.fillStyle = cs.s2; ctx.fillRect(x, y, cell, cell);
        ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x, y, cell, 1.5);
        if (h > 0.02) {
          ctx.globalAlpha = Math.min(1, h * 1.1);
          ctx.fillStyle = kind[i] === 1 ? cs.am : cs.ac; ctx.fillRect(x, y, cell, cell);
          ctx.globalAlpha = 1;
        }
        if (m) {
          var delay = 250 + m.i * 260 + m.r * 70 + (m.c % 2) * 40;
          if (intro > delay) {
            var age = Math.min(1, (intro - delay) / 220), lift = (1 - age) * 6 + h * 2.5;
            ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x, y + 2, cell, cell);
            ctx.fillStyle = RAMPS[cs.th][m.bar][m.r]; ctx.globalAlpha = age;
            ctx.fillRect(x, y - lift, cell, cell);
            ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(x, y - lift, cell, 1.5);
            ctx.globalAlpha = 1;
          }
        }
      }
    }
    function frame(now) {
      raf = 0;
      if (now - last > 200 && !WB.reduced) {
        last = now;
        if (Math.random() < 0.7) warm(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 0.55, Math.random() < 0.22 ? 1 : 0);
      }
      var live = false;
      for (var i = 0; i < heat.length; i++) { if (heat[i] > 0.02) { heat[i] *= 0.93; live = true; } else heat[i] = 0; }
      draw(now);
      if (visible && !WB.reduced) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible && !WB.reduced) raf = requestAnimationFrame(frame); }

    readColors(); size();
    var host = canvas.parentElement;
    host.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect(); burst(e.clientX - r.left, e.clientY - r.top, 0);
    });
    host.addEventListener('pointerdown', function (e) {
      var r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      for (var k = 0; k < 6; k++) burst(px + (Math.random() - .5) * 140, py + (Math.random() - .5) * 140, 1);
    });
    if ('ResizeObserver' in window) new ResizeObserver(function () { size(); }).observe(canvas);
    window.addEventListener('themechange', function () { readColors(); draw(performance.now()); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }, { threshold: 0 }).observe(canvas);
    }
    if (WB.reduced) draw(performance.now()); else raf = requestAnimationFrame(frame);
  };
  var pf = document.getElementById('pixelfield');
  if (pf) WB.pixelField(pf);
})();
