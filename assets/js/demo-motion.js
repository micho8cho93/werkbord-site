/* The motion of the app, for the demo's two simulators. It follows web/src/lib/motion.ts, internal/uipresentation/static/motion.js and
   web/src/lib/mark-motion.ts, and docs/MOTION.md: motion connects an action to its result and never delays it, and it replays nothing on
   a first paint. Under reduced motion, or in a hidden page, nothing moves and every label, number and result is already there.
   The simulators repaint with innerHTML, so the pieces here work in pairs: begin() before a repaint, end() after it. */
(function () {
  'use strict';
  var WB = (window.WB = window.WB || {});
  var M = (WB.motion = {});
  var EASE = 'cubic-bezier(.16,1,.3,1)';
  var query = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  M.reduced = function () { return document.hidden || query.matches; };

  /* ---------- one animation at a time, cancelled when the page hides ---------- */
  var live = [];
  M.animate = function (node, frames, ms) {
    if (M.reduced() || !node || !node.isConnected || typeof node.animate !== 'function') return null;
    var a = node.animate(frames, { duration: ms || 180, easing: EASE });
    live.push(a);
    var drop = function () { var i = live.indexOf(a); if (i > -1) live.splice(i, 1); };
    a.finished.then(drop, drop);
    return a;
  };
  M.cancel = function () { live.slice().forEach(function (a) { a.cancel(); }); live = []; };
  function paused() { document.documentElement.toggleAttribute('data-motion-paused', document.hidden); if (document.hidden) M.cancel(); }
  document.addEventListener('visibilitychange', paused); paused();
  if (query.addEventListener) query.addEventListener('change', M.cancel);

  /* The simulators are drawn at a fixed size and scaled, so positions are kept in the window's own pixels. */
  function scaleOf(root) { var w = root.offsetWidth; return w ? root.getBoundingClientRect().width / w : 1; }
  function scrollSig(node, root) {
    var sig = '';
    for (var p = node.parentElement; p && p !== root; p = p.parentElement) if (p.scrollHeight > p.clientHeight || p.scrollWidth > p.clientWidth) sig += p.scrollTop + ',' + p.scrollLeft + ';';
    return sig;
  }

  /* ---------- cards: where they are, and where they go ---------- */
  M.snapshot = function (root) {
    var s = scaleOf(root), rb = root.getBoundingClientRect(), items = {};
    root.querySelectorAll('[data-mk]').forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom <= rb.top || r.top >= rb.bottom || r.right <= rb.left || r.left >= rb.right) return;
      var host = n.closest('[data-mp]');
      items[n.dataset.mk] = { node: n, x: (r.left - rb.left) / s, y: (r.top - rb.top) / s, w: r.width / s, h: r.height / s, part: host ? host.dataset.mp : '', sc: scrollSig(n, root) };
    });
    return { items: items, width: rb.width };
  };
  /* The lists on show. Moves are animated only inside the same lists: a new page is a new baseline, never a replay. */
  M.parts = function (root) {
    var seen = {};
    root.querySelectorAll('[data-mp]').forEach(function (n) { seen[n.dataset.mp] = 1; });
    return Object.keys(seen).sort().join('|');
  };
  var KEEP = ['data-tone', 'data-p', 'data-kind', 'data-lit'];
  /* A copy for the eye only: nothing in it can be pressed, found by the guide, or announced. */
  function floating(root, it, z) {
    var g = it.node.cloneNode(true), all = [g].concat([].slice.call(g.querySelectorAll('*')));
    all.forEach(function (el) {
      [].slice.call(el.attributes).forEach(function (a) { if (a.name === 'id' || a.name === 'for' || a.name === 'tabindex' || (a.name.indexOf('data-') === 0 && KEEP.indexOf(a.name) < 0)) el.removeAttribute(a.name); });
    });
    g.classList.remove('fresh', 'dragging', 'selected');
    g.setAttribute('aria-hidden', 'true'); g.setAttribute('data-motion-ghost', ''); g.inert = true;
    var st = g.style;
    st.position = 'absolute'; st.inset = 'auto'; st.left = it.x + 'px'; st.top = it.y + 'px'; st.width = it.w + 'px'; st.height = it.h + 'px';
    st.margin = '0'; st.maxHeight = 'none'; st.transform = 'none'; st.animation = 'none'; st.boxSizing = 'border-box'; st.pointerEvents = 'none'; st.zIndex = z || '19';
    root.appendChild(g);
    return g;
  }
  var flights = [];
  function ground(root) {
    flights = flights.filter(function (f) {
      if (f.root !== root) return true;
      f.move.cancel(); if (f.cover) f.cover.cancel(); f.copy.remove();
      return false;
    });
  }
  /* Confirmed moves between lists travel (240 ms), the neighbours settle (200 ms), a card that arrives comes in (180 ms), and one
     that leaves fades where it stood (160 ms). A different window width, or a list scrolled in between, is a new baseline. */
  M.layout = function (root, before, opts) {
    opts = opts || {};
    var inflight = {};
    flights.forEach(function (f) { if (f.root === root) inflight[f.key] = f.copy; });
    var s = scaleOf(root), rb = root.getBoundingClientRect();
    Object.keys(inflight).forEach(function (key) {
      var old = before.items[key], r = inflight[key].getBoundingClientRect();
      if (old) { old.x = (r.left - rb.left) / s; old.y = (r.top - rb.top) / s; }
    });
    ground(root);
    var after = M.snapshot(root);
    if (M.reduced() || Math.abs(before.width - after.width) > 1) return;
    Object.keys(after.items).forEach(function (key) {
      var it = after.items[key], old = before.items[key];
      if (!old) { M.animate(it.node, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], 180); return; }
      if (old.sc !== it.sc) return;
      var dx = old.x - it.x, dy = old.y - it.y;
      if (Math.abs(dx) + Math.abs(dy) < 1) return;
      if (old.part !== it.part) {
        var copy = floating(root, old), move = M.animate(copy, [{ transform: 'none' }, { transform: 'translate(' + (-dx) + 'px,' + (-dy) + 'px)' }], 240), cover = M.animate(it.node, [{ opacity: 0 }, { opacity: 0 }], 240);
        if (!move) { copy.remove(); return; }
        var flight = { root: root, key: key, copy: copy, move: move, cover: cover };
        flights.push(flight);
        var landed = function () {
          copy.remove(); if (cover) cover.cancel();
          var i = flights.indexOf(flight); if (i > -1) flights.splice(i, 1);
          if (opts.arrived && it.node.isConnected) opts.arrived(it.node, it);
        };
        move.finished.then(landed, function () { copy.remove(); });
      } else M.animate(it.node, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], 200);
    });
    Object.keys(before.items).forEach(function (key) {
      if (after.items[key]) return;
      var copy = floating(root, before.items[key]), out = M.animate(copy, [{ opacity: 1 }, { opacity: 0 }], 160);
      if (out) out.finished.then(function () { copy.remove(); }, function () { copy.remove(); }); else copy.remove();
    });
  };

  /* ---------- layers: a panel, a sheet and its backdrop arrive over 220 ms and leave over 180 ms ---------- */
  M.surfaces = function (root) {
    var s = scaleOf(root), rb = root.getBoundingClientRect(), found = {};
    root.querySelectorAll('[data-surface]').forEach(function (n) {
      var r = n.getBoundingClientRect();
      found[n.dataset.surface] = { node: n, x: (r.left - rb.left) / s, y: (r.top - rb.top) / s, w: r.width / s, h: r.height / s, z: getComputedStyle(n).zIndex };
    });
    return found;
  };
  // How each layer arrives and leaves: a panel slides in from the right, a sheet rises, a backdrop only fades, a progress banner arrives and is simply gone.
  var KINDS = { panel: { x: 20, y: 0, ms: 220, out: 180 }, mtask: { x: 20, y: 0, ms: 220, out: 180 }, sheet: { x: 0, y: 16, ms: 220, out: 180 }, scrim: { x: 0, y: 0, ms: 140, out: 140 }, wfb: { x: 0, y: 6, ms: 180, out: 0 } };
  function kindOf(key) { return KINDS[key.split(':')[0]]; }
  M.settle = function (root, before) {
    if (M.reduced()) return;
    var now = M.surfaces(root);
    Object.keys(now).forEach(function (key) {
      var k = kindOf(key); if (!k || before[key]) return;
      var node = now[key].node, base = getComputedStyle(node).transform; base = base === 'none' ? '' : base + ' ';
      M.animate(node, [{ opacity: 0, transform: base + 'translate(' + k.x + 'px,' + k.y + 'px)' }, { opacity: 1, transform: base + 'translate(0,0)' }], k.ms);
    });
    Object.keys(before).forEach(function (key) {
      var k = kindOf(key); if (!k || !k.out || now[key]) return;
      var copy = floating(root, before[key], before[key].z === 'auto' ? '' : before[key].z);
      var out = M.animate(copy, [{ opacity: 1, transform: 'translate(0,0)' }, { opacity: 0, transform: 'translate(' + k.x + 'px,' + k.y + 'px)' }], k.out);
      if (out) out.finished.then(function () { copy.remove(); }, function () { copy.remove(); }); else copy.remove();
    });
  };

  /* ---------- the pair of calls a repaint makes ---------- */
  M.begin = function (root) {
    if (!root || !root.getClientRects().length) return null;
    return { snap: M.snapshot(root), surf: M.surfaces(root), charts: M.chartState(root), parts: M.parts(root), rev: root._wbRev };
  };
  M.end = function (root, b, rev, opts) {
    var was = root._wbRev;
    root._wbRev = rev;
    if (!b) return;
    M.settle(root, b.surf);
    M.charts(root, b.charts);
    if (was !== undefined && was !== rev && M.parts(root) === b.parts) M.layout(root, b.snap, opts);
  };
  /* A layer that is replaced by itself, such as a sheet that opens or closes in the overlay. */
  M.within = function (root, change) {
    var before = root && root.getClientRects().length ? M.surfaces(root) : null;
    change();
    if (before) M.settle(root, before);
  };

  /* ---------- charts: bars grow from their baseline; the numbers are already there ---------- */
  M.chartState = function (root) {
    var out = {};
    root.querySelectorAll('[data-chart-key]').forEach(function (n) { out[n.dataset.chartKey] = { value: +n.dataset.chartValue, scope: n.dataset.chartScope }; });
    return out;
  };
  M.charts = function (root, before) {
    if (root._wbCharts) root._wbCharts.disconnect();
    if (M.reduced() || !('IntersectionObserver' in window)) return;
    var watcher = root._wbCharts = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = e.target, value = +n.dataset.chartValue, prev = before && before[n.dataset.chartKey], vertical = n.dataset.chartAxis === 'y';
        var from = prev ? (value > 0 ? prev.value / value : 0) : 0;
        M.animate(n, [{ transform: 'scale' + (vertical ? 'Y' : 'X') + '(' + from + ')' }, { transform: 'none' }], prev ? 280 : vertical ? 480 : 420);
        watcher.unobserve(n);
      });
    });
    root.querySelectorAll('[data-chart-key]').forEach(function (n) {
      var prev = before && before[n.dataset.chartKey];
      if (!prev || prev.scope !== n.dataset.chartScope) watcher.observe(n);
    });
  };

  /* ---------- a small local acknowledgement of something that was reported ---------- */
  M.acknowledge = function (node) {
    if (!node) return;
    var background = getComputedStyle(node).backgroundColor;
    M.animate(node, [{ backgroundColor: 'color-mix(in srgb, var(--ok) 12%, var(--surface))' }, { backgroundColor: background }], 350);
    node.querySelectorAll('svg').forEach(function (icon) { M.animate(icon, [{ opacity: .3 }, { opacity: 1 }], 180); });
  };

  /* ---------- Salie's words: only what has just arrived fades in (120 ms), and what was there stays still ---------- */
  function selecting(node) {
    var sel = document.getSelection();
    return !!sel && !sel.isCollapsed && (node.contains(sel.anchorNode) || node.contains(sel.focusNode));
  }
  function compact(node) {
    if (node.childNodes.length < 2 || selecting(node) || (node.getAnimations && node.getAnimations({ subtree: true }).length)) return;
    node.textContent = node._wbText;
  }
  M.stream = function (node, text, animated) {
    var prev = node._wbText != null ? node._wbText : node.textContent;
    node._wbText = text;
    if (text === prev) return;
    if (text.indexOf(prev) !== 0) { node.textContent = text; return; }
    var tail = document.createElement('span');
    tail.textContent = text.slice(prev.length);
    node.appendChild(tail);
    var a = animated ? M.animate(tail, [{ opacity: 0 }, { opacity: 1 }], 120) : null;
    if (a) a.finished.then(function () { compact(node); }, function () { compact(node); }); else compact(node);
  };

  /* ---------- the pixel mark at work: 48 cells, six approved studies, one per reply, capped at 30 fps ---------- */
  var STUDIES = ['helix', 'wave', 'orbit', 'infinity', 'relay', 'domino'];
  M.studies = STUDIES;
  var TAU = Math.PI * 2;
  function frame(motion, seconds, amount) {
    var phase = seconds * TAU / 2, cells = [];
    for (var bar = 0; bar < 3; bar++) for (var row = 0; row < 8; row++) for (var col = 0; col < 2; col++) {
      var ox = 36 * (bar + 1) - 12 * Math.floor(row / 2) + 12 * col + 5 - 65, oy = 12 * row + 5 - 47;
      var x = ox, y = oy, width = 10, height = 10, angle = 0, depth = 1, opacity, theta;
      if (motion === 'helix') {
        theta = phase + row * .82 + bar * TAU / 3; depth = (Math.cos(theta) + 1) / 2;
        x = 35 * Math.sin(theta) + (col - .5) * 12 * (.65 + .35 * depth) - oy * .1; width = height = 6.5 + 3.5 * depth; opacity = .4 + .6 * depth;
      } else if (motion === 'wave') {
        theta = phase - row * .62 - bar * .62; x += 12 * Math.sin(theta); y += 5 * Math.sin(theta + .45); opacity = .72 + .28 * (.5 + .5 * Math.cos(theta));
      } else if (motion === 'orbit') {
        theta = -Math.PI / 2 + bar * TAU / 3 + phase; depth = (Math.sin(theta) + 1) / 2;
        var scale = .68 + .32 * depth, localX = ox - 36 * (bar - 1);
        angle = .3 * Math.cos(theta);
        x = 40 * Math.cos(theta) + (localX * Math.cos(angle) - oy * Math.sin(angle)) * .8 * scale;
        y = 19 * Math.sin(theta) + (localX * Math.sin(angle) + oy * Math.cos(angle)) * .8 * scale;
        width = height = 8 * scale; opacity = .48 + .52 * depth;
      } else if (motion === 'infinity') {
        theta = (bar * 8 + row) * TAU / 24 - phase;
        var dx = 52 * Math.cos(theta), dy = 52 * Math.cos(2 * theta), norm = Math.max(1, Math.hypot(dx, dy));
        x = 52 * Math.sin(theta) - (col - .5) * 9 * dy / norm; y = 26 * Math.sin(2 * theta) + (col - .5) * 9 * dx / norm;
        depth = (Math.cos(theta) + 1) / 2; width = height = 6.8 + 1.5 * depth; opacity = .55 + .45 * depth; angle = Math.atan2(dy, dx);
      } else if (motion === 'relay') {
        var bump = Math.pow(.5 + .5 * Math.cos(phase - row * .65 - bar * .85), 4);
        x += 5 * bump; y -= 7 * bump; width = height = 8 + 2 * bump; opacity = .48 + .52 * bump;
      } else {
        theta = phase - row * .5 - bar * .68; x += 3 * Math.sin(theta); y += 2 * Math.sin(theta);
        width = 10 * Math.max(.13, Math.abs(Math.cos(theta))); opacity = .48 + .52 * Math.abs(Math.cos(theta));
      }
      cells.push({ index: bar * 16 + row * 2 + col, x: ox + (x - ox) * amount + 65, y: oy + (y - oy) * amount + 47,
        width: 10 + (width - 10) * amount, height: 10 + (height - 10) * amount, angle: amount ? angle * amount : 0, depth: 1 + (depth - 1) * amount, opacity: 1 + (opacity - 1) * amount });
    }
    return cells.sort(function (a, b) { return a.depth - b.depth || a.index - b.index; });
  }
  /* The mark, as the product draws it: every cell has its own flat shade, from the theme's ramp (see --mk-* in app.css). */
  M.markHTML = function (height, study, index) {
    var cells = '';
    for (var bar = 0; bar < 3; bar++) for (var row = 0; row < 8; row++) {
      var x = 36 * (bar + 1) - 12 * Math.floor(row / 2), fill = 'style="fill:var(--mk-' + bar + '-' + row + ')"';
      cells += '<rect x="' + x + '" y="' + 12 * row + '" width="10" height="10" ' + fill + '/><rect x="' + (x + 12) + '" y="' + 12 * row + '" width="10" height="10" ' + fill + '/>';
    }
    return '<svg class="w-livemark" viewBox="0 0 130 94" height="' + height + '" width="' + Math.round(height * 130 / 94) + '" aria-hidden="true" data-study="' + study + '"' + (index != null ? ' data-mi="' + index + '"' : '') + '>' + cells + '</svg>';
  };
  /* A reply's mark is a function of time and of one small record, so a repaint that replaces the node carries on from the same pose.
     The record: { study, t0, stopAt } (stopAt is set once Stop is pending and the mark settles back to the original). */
  var marks = [], loop = 0, last = 0, onScreen = true;
  function amountOf(rec, now) {
    var up = Math.max(0, Math.min(1, (now - rec.t0) / 720));
    if (rec.stopAt == null) return up;
    var atStop = Math.max(0, Math.min(1, (rec.stopAt - rec.t0) / 720));
    return Math.max(0, atStop - (now - rec.stopAt) / 720);
  }
  function rest(node) {
    var cells = [].slice.call(node.querySelectorAll('rect')).sort(function (a, b) { return a._i - b._i; });
    cells.forEach(function (c) { c.removeAttribute('transform'); c.style.removeProperty('opacity'); node.appendChild(c); });
    node.dataset.motionRunning = 'false';
  }
  function paint(node, rec, now) {
    var cells = node._cells, amount = amountOf(rec, now), blend = amount * amount * (3 - 2 * amount);
    if (amount <= 0 && rec.stopAt != null) { if (node.dataset.motionRunning !== 'false') rest(node); return; }
    frame(rec.study, (now - rec.t0) / 1000, blend).forEach(function (c, order) {
      var el = cells[c.index], o = node._origins[c.index];
      var a = Math.cos(c.angle) * c.width / 10, b = Math.sin(c.angle) * c.width / 10, cc = -Math.sin(c.angle) * c.height / 10, d = Math.cos(c.angle) * c.height / 10;
      el.setAttribute('transform', 'matrix(' + [a, b, cc, d, c.x - a * o.x - cc * o.y, c.y - b * o.x - d * o.y].map(function (v) { return v.toFixed(3); }).join(' ') + ')');
      el.style.opacity = c.opacity.toFixed(3);
      if (node.children[order] !== el) node.insertBefore(el, node.children[order] || null);
    });
    node.dataset.motionRunning = 'true';
  }
  function tick(now) {
    loop = 0;
    marks = marks.filter(function (m) { return m.node.isConnected; });
    if (!marks.length) return;
    loop = requestAnimationFrame(tick);
    if (document.hidden || !onScreen || M.reduced() || now - last < 1000 / 30) return;
    last = now;
    marks.forEach(function (m) { if (m.node.getClientRects().length) paint(m.node, m.rec, now); });
  }
  M.mark = function (node, rec) {
    if (!node._cells) {
      node._cells = [].slice.call(node.querySelectorAll('rect'));
      node._cells.forEach(function (c, i) { c._i = i; });
      node._origins = node._cells.map(function (c) { return { x: +c.getAttribute('x') + 5, y: +c.getAttribute('y') + 5 }; });
    }
    if (!marks.some(function (m) { return m.node === node; })) marks.push({ node: node, rec: rec });
    if (!loop) loop = requestAnimationFrame(tick);
    if (M.reduced()) rest(node);
  };
  query.addEventListener && query.addEventListener('change', function () { marks.forEach(function (m) { if (M.reduced()) rest(m.node); }); });
  /* The loop runs only while a simulator is on screen (on a phone the demo section has no box of its own, so its two mounts are watched). */
  var seen = {};
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      onScreen = Object.keys(seen).some(function (k) { return seen[k]; });
    });
    ['app-demo', 'phone-demo'].forEach(function (id) { var n = document.getElementById(id); if (n) io.observe(n); });
  }
})();
