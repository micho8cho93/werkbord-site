/* The guided demo's notes. One quiet note at a time: a soft ring on the control or area it is about, a thin line from the
   ring to a small card with the words, and, when there is something to press that is not in the app, a button on the card.
   app-demo.js decides what to say and where; this file only draws it, and keeps it in place while the app redraws, scrolls
   and scales. On a small screen the note docks above the phone instead of floating over it. No dependencies. */
(function () {
  'use strict';
  var NOTE_W = 272, GAP = 30, MARGIN = 10;
  var spec = null, layer = null, ring = null, extra = [], svg = null, line = null, dot = null, note = null;
  var kicker = null, text = null, acts = null, frame = 0, shown = '', misses = 0, retry = 0, onAction = function () {};

  function el(tag, cls, parent) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }

  function build(host) {
    if (layer && layer.parentNode === host) return;
    if (!layer) {
      layer = el('div', 'guide-layer');
      layer.setAttribute('aria-hidden', 'false');
      ring = el('div', 'guide-ring', layer);
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'guide-line');
      svg.setAttribute('aria-hidden', 'true');
      line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3');
      svg.appendChild(line); svg.appendChild(dot);
      layer.appendChild(svg);
      note = el('div', 'guide-note', layer);
      note.id = 'demo-guide-note';
      note.setAttribute('role', 'status');
      note.setAttribute('aria-live', 'polite');
      note.setAttribute('aria-atomic', 'true');
      var x = el('button', 'guide-x', note);
      x.type = 'button'; x.setAttribute('data-key', 'hide'); x.setAttribute('aria-label', 'Hide this note');
      x.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
      x.addEventListener('click', function () { onAction('hide'); });
      kicker = el('p', 'guide-kicker', note);
      text = el('p', 'guide-text', note);
      acts = el('div', 'guide-acts', note);
      acts.addEventListener('click', function (e) {
        var b = e.target.closest('[data-key]');
        if (b) onAction(b.getAttribute('data-key'));
      });
    }
    host.appendChild(layer);
  }

  function fill(s) {
    var sig = s.id + '|' + s.kicker + '|' + s.text + '|' + (s.actions || []).map(function (a) { return a.key; }).join();
    if (sig === shown) return;
    shown = sig;
    kicker.textContent = s.kicker || '';
    kicker.hidden = !s.kicker;
    text.textContent = s.text;
    acts.innerHTML = '';
    (s.actions || []).forEach(function (a) {
      var b = el(a.href ? 'a' : 'button', 'guide-act' + (a.primary ? ' pri' : ''), acts);
      if (a.href) b.href = a.href; else b.type = 'button';
      b.setAttribute('data-key', a.key);
      b.textContent = a.label;
    });
    acts.hidden = !(s.actions || []).length;
    // The words fade in again when the step changes, and not when only the position does.
    note.classList.remove('is-new'); void note.offsetWidth; note.classList.add('is-new');
  }

  /* What of the element can be seen: its box, cut by every ancestor that clips it (a scrolling list, the window). */
  function seen(n) {
    var r = n.getBoundingClientRect(), x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom;
    for (var a = n.parentElement; a && a !== document.body; a = a.parentElement) {
      var cs = getComputedStyle(a);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflowY)) {
        var b = a.getBoundingClientRect();
        x0 = Math.max(x0, b.left); y0 = Math.max(y0, b.top); x1 = Math.min(x1, b.right); y1 = Math.min(y1, b.bottom);
      }
    }
    return { left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0 };
  }
  function rectOf(n, H) {
    var r = seen(n);
    return { x: r.left - H.left, y: r.top - H.top, w: Math.max(0, r.width), h: Math.max(0, r.height) };
  }
  function union(rs) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    rs.forEach(function (r) { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  /* A target is on show when it has a size, lies inside the simulator, and nothing of the page sits over it: the assistant
     over the window, say, or a panel's dock over a button that has scrolled out of reach. */
  function onShow(n, H) {
    var r = seen(n);
    if (r.width < 1 || r.height < 1) return false;
    var cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 24);
    if (cx < H.left || cx > H.right || cy < H.top || cy > H.bottom) return false;
    var hit = document.elementFromPoint(Math.min(Math.max(cx, 1), innerWidth - 1), Math.min(Math.max(cy, 1), innerHeight - 1));
    return !!hit && (n.contains(hit) || !!hit.closest('.guide-note'));
  }
  function setRing(n, r, pad, kind, on) {
    n.className = 'guide-ring ' + kind + (on ? ' is-on' : '');
    if (!on) return;
    n.style.width = (r.w + pad * 2) + 'px';
    n.style.height = (r.h + pad * 2) + 'px';
    n.style.transform = 'translate(' + (r.x - pad) + 'px,' + (r.y - pad) + 'px)';
  }

  function place() {
    frame = 0;
    if (!spec || !layer || !layer.parentNode) return;
    var host = layer.parentNode, H = host.getBoundingClientRect();
    var live = (spec.els || []).filter(function (n) { return n && n.isConnected && onShow(n, H); });
    var kind = spec.kind === 'area' ? 'area' : 'press', pad = kind === 'area' ? 5 : 3;
    var rects = live.map(function (n) { return rectOf(n, H); });
    var has = rects.length > 0;
    // A target that exists but is not on show yet (the page is still arriving, or something sits over it): wait for it, quietly.
    var waiting = (spec.els || []).length > 0 && !has && !spec.wait;
    note.classList.toggle('is-quiet', waiting);
    if (waiting && misses++ < 60) { clearTimeout(retry); retry = setTimeout(schedule, 250); }
    var wasOn = ring.classList.contains('is-on');
    if (!wasOn) ring.style.transition = 'none';
    setRing(ring, has ? (kind === 'area' ? union(rects) : rects[0]) : null, pad, kind, has);
    if (!wasOn) { void ring.offsetWidth; ring.style.transition = ''; }
    // Further press targets get a ring of their own, with no line.
    while (extra.length < Math.max(0, rects.length - 1) && kind === 'press') extra.push(el('div', 'guide-ring press', layer));
    extra.forEach(function (n, i) { setRing(n, rects[i + 1], pad, 'press', kind === 'press' && !!rects[i + 1]); });

    var dockNow = note.classList.contains('is-dock');
    if (dockNow) { line.removeAttribute('d'); dot.setAttribute('r', '0'); return; }
    var hw = H.width, hh = H.height, W = note.offsetWidth || NOTE_W, Nh = note.offsetHeight || 80;
    var R = has ? { x: (kind === 'area' ? union(rects) : rects[0]).x - pad, y: (kind === 'area' ? union(rects) : rects[0]).y - pad, w: (kind === 'area' ? union(rects) : rects[0]).w + pad * 2, h: (kind === 'area' ? union(rects) : rects[0]).h + pad * 2 } : null;
    var x, y, side = '';
    var top = MARGIN + ((spec.inset && spec.inset.top) || 0);
    function cx(v) { return Math.max(MARGIN, Math.min(v, hw - W - MARGIN)); }
    function cy(v) { return Math.max(top, Math.min(v, hh - Nh - MARGIN)); }
    // Beside the phone, never on it: the note keeps clear of the device and reaches in with its line.
    var K = spec.keep && spec.keep.isConnected ? rectOf(spec.keep, H) : null;
    function clear(px, py) { return !K || px + W <= K.x - 6 || px >= K.x + K.w + 6 || py + Nh <= K.y || py >= K.y + K.h; }
    function fits(px, py) { return px >= MARGIN - 1 && py >= top - 1 && px + W <= hw - MARGIN + 1 && py + Nh <= hh - MARGIN + 1 && clear(px, py); }
    if (R) {
      var mx = R.x + R.w / 2, my = R.y + R.h / 2;
      var c = {
        right: [R.x + R.w + GAP, cy(my - Nh / 2)], left: [R.x - GAP - W, cy(my - Nh / 2)],
        below: [cx(mx - W / 2), R.y + R.h + GAP], above: [cx(mx - W / 2), R.y - GAP - Nh]
      };
      var order = mx > hw * 0.5 ? ['left', 'below', 'above', 'right'] : ['right', 'below', 'above', 'left'];
      if (K) {
        c.right = [K.x + K.w + GAP, cy(my - Nh / 2)]; c.left = [K.x - GAP - W, cy(my - Nh / 2)];
        order = mx > K.x + K.w / 2 ? ['right', 'left'] : ['left', 'right'];
      }
      order.some(function (s) {
        if (fits(c[s][0], c[s][1])) { side = s; x = c[s][0]; y = c[s][1]; return true; }
      });
    }
    if (!side) {
      // Nowhere beside the target: sit in the corner farthest from it, with no line.
      var right = !R || R.x + R.w / 2 < hw / 2, low = !R || R.y + R.h / 2 < hh / 2;
      x = right ? hw - W - MARGIN : MARGIN; y = low ? hh - Nh - MARGIN : top;
    }
    note.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    if (side && has && spec.line !== false) {
      var x1, y1, x2, y2;
      if (side === 'right' || side === 'left') {
        y1 = Math.min(Math.max(my, y + 16), y + Nh - 16); x1 = side === 'right' ? x : x + W;
        x2 = side === 'right' ? R.x + R.w : R.x; y2 = Math.min(Math.max(y1, R.y + 8), R.y + R.h - 8);
      } else {
        x1 = Math.min(Math.max(mx, x + 16), x + W - 16); y1 = side === 'below' ? y : y + Nh;
        y2 = side === 'below' ? R.y + R.h : R.y; x2 = Math.min(Math.max(x1, R.x + 8), R.x + R.w - 8);
      }
      line.setAttribute('d', 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1));
      dot.setAttribute('cx', x2.toFixed(1)); dot.setAttribute('cy', y2.toFixed(1)); dot.setAttribute('r', '3');
    } else { line.removeAttribute('d'); dot.setAttribute('r', '0'); }
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(place); }

  window.WBGuide = {
    /* s: { id, kicker, text, els: [elements, the first is the one the line goes to], kind: 'press' | 'area', actions: [{key, label, primary, href}],
            host: where the layer lives, dock: an element to dock the note in (small screens) or null } */
    show: function (s) {
      spec = s; misses = 0;
      build(s.host);
      layer.classList.remove('is-off');
      var wantDock = !!s.dock;
      if (wantDock) { if (note.parentNode !== s.dock.parent) s.dock.parent.insertBefore(note, s.dock.before); }
      else if (note.parentNode !== layer) layer.appendChild(note);
      note.classList.toggle('is-dock', wantDock);
      fill(s);
      schedule();
    },
    hide: function () {
      spec = null; shown = '';
      if (layer) layer.classList.add('is-off');
      if (note && note.classList.contains('is-dock') && layer) layer.appendChild(note);
      if (ring) ring.classList.remove('is-on');
      extra.forEach(function (n) { n.classList.remove('is-on'); });
      if (line) { line.removeAttribute('d'); dot.setAttribute('r', '0'); }
    },
    place: schedule,
    onAction: function (fn) { onAction = fn; },
    note: function () { return note; }
  };

  window.addEventListener('resize', schedule);
  document.addEventListener('scroll', schedule, true);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
})();
