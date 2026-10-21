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
      note.addEventListener('pointerdown', startDrag);
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

  /* What of the element can be seen: its box, cut by every ancestor that clips it (a scrolling list, the window), and by
     the bars that float over the app's content (spec.cover: the phone's tab bar), unless the element is in one of them. */
  function seen(n) {
    var r = n.getBoundingClientRect(), x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom;
    for (var a = n.parentElement; a && a !== document.body; a = a.parentElement) {
      var cs = getComputedStyle(a);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflowY)) {
        var b = a.getBoundingClientRect();
        if (/(auto|scroll|hidden|clip)/.test(cs.overflowX)) { x0 = Math.max(x0, b.left); x1 = Math.min(x1, b.right); }
        if (/(auto|scroll|hidden|clip)/.test(cs.overflowY)) { y0 = Math.max(y0, b.top); y1 = Math.min(y1, b.bottom); }
      }
    }
    ((spec && spec.cover) || []).forEach(function (c) {
      if (!c || !c.isConnected || c.contains(n)) return;
      var b = c.getBoundingClientRect();
      if (b.left > x0 + 1 || b.right < x1 - 1 || b.bottom <= y0 || b.top >= y1) return;
      if (b.top > y0) y1 = Math.min(y1, b.top); else y0 = Math.max(y0, b.bottom);
    });
    return { left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0 };
  }
  function rectOf(n, H) {
    var r = seen(n);
    return { x: (r.left - H.left) / H.sx, y: (r.top - H.top) / H.sy, w: Math.max(0, r.width) / H.sx, h: Math.max(0, r.height) / H.sy };
  }
  /* The target's own corner radius, as drawn on screen (the desktop window is scaled), so the ring follows its shape:
     round on a round Back button, the key's curve on a deck key. */
  function radiusOf(n, H) {
    var cs = getComputedStyle(n), v = cs.borderTopLeftRadius, b = n.getBoundingClientRect();
    var scale = n.offsetWidth ? b.width / n.offsetWidth : 1, px = parseFloat(v) || 0;
    if (/%$/.test(v)) px = px / 100 * Math.min(n.offsetWidth, n.offsetHeight);
    return Math.min(px, Math.min(n.offsetWidth, n.offsetHeight) / 2) * scale / H.sx;
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
  function setRing(n, r, pad, kind, on, radius) {
    n.className = 'guide-ring ' + kind + (on ? ' is-on' : '');
    if (!on) return;
    n.style.width = (r.w + pad * 2) + 'px';
    n.style.height = (r.h + pad * 2) + 'px';
    n.style.transform = 'translate(' + (r.x - pad) + 'px,' + (r.y - pad) + 'px)';
    n.style.borderRadius = radius == null ? '' : Math.max(4, radius + pad) + 'px';
  }

  function place() {
    frame = 0;
    if (!spec || !layer || !layer.parentNode) return;
    var H = layer.getBoundingClientRect();
    H.sx = H.width / (layer.clientWidth || H.width) || 1;
    H.sy = H.height / (layer.clientHeight || H.height) || 1;
    var live = (spec.els || []).filter(function (n) { return n && n.isConnected && onShow(n, H); });
    var kind = spec.kind === 'area' ? 'area' : 'press', pad = 2;
    var rects = live.map(function (n) { return rectOf(n, H); });
    var has = rects.length > 0;
    // A target that exists but is not on show yet (the page is still arriving, or something sits over it): wait for it, quietly.
    var waiting = (spec.els || []).length > 0 && !has && !spec.wait;
    note.classList.toggle('is-quiet', waiting);
    if (waiting && misses++ < 60) { clearTimeout(retry); retry = setTimeout(schedule, 250); }
    var wasOn = ring.classList.contains('is-on');
    if (!wasOn) ring.style.transition = 'none';
    // One area keeps the area's own corners; several areas together get the ring's default.
    var radius = has && (kind === 'press' || rects.length === 1) ? radiusOf(live[0], H) : null;
    setRing(ring, has ? (kind === 'area' ? union(rects) : rects[0]) : null, pad, kind, has, radius);
    if (!wasOn) { void ring.offsetWidth; ring.style.transition = ''; }
    // Further press targets get a ring of their own, with no line.
    while (extra.length < Math.max(0, rects.length - 1) && kind === 'press') extra.push(el('div', 'guide-ring press', layer));
    extra.forEach(function (n, i) { setRing(n, rects[i + 1], pad, 'press', kind === 'press' && !!rects[i + 1], rects[i + 1] ? radiusOf(live[i + 1], H) : null); });

    var dockNow = note.classList.contains('is-dock');
    if (dockNow) { note.style.width = ''; note.style.transform = 'none'; line.removeAttribute('d'); dot.setAttribute('r', '0'); return; }
    var hw = layer.clientWidth, hh = layer.clientHeight;
    var K = spec.keep && spec.keep.isConnected ? rectOf(spec.keep, H) : null;
    var R = null;
    if (has) { var U = kind === 'area' ? union(rects) : rects[0]; R = { x: U.x - pad, y: U.y - pad, w: U.w + pad * 2, h: U.h + pad * 2 }; }
    var top = MARGIN + ((spec.inset && spec.inset.top) || 0);
    var x, y, W, Nh, side = true;
    if (K) {
      // Beside the phone, never on it: the note keeps clear of the device and reaches in with its line.
      var available = Math.max(K.x, hw - K.x - K.w) - GAP - MARGIN;
      note.style.width = Math.min(NOTE_W, Math.max(150, available)) + 'px';
      W = note.offsetWidth || NOTE_W; Nh = note.offsetHeight || 80;
      var pos = besideDevice(R, K, W, Nh, hw, hh, top);
      x = pos.x; y = pos.y; side = pos.side;
    } else {
      var obst = kind === 'area' ? [R] : rects.map(function (r) { return { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 }; });
      obst = obst.filter(Boolean);
      var now = Date.now(), c = cache;
      var rc = R ? { x: R.x + R.w / 2, y: R.y + R.h / 2 } : null;
      var picked = null, again = !c || c.id !== spec.id || c.hw !== hw || c.hh !== hh || c.top !== top;
      if (!again) {
        note.style.width = c.W + 'px';
        var nh = note.offsetHeight || 80;
        if (Math.abs(nh - c.Nh) > 2) again = true;
        else if (obst.some(function (o) { return hits(c.x - 4, c.y - 4, c.W + 8, c.Nh + 8, o); })) again = true;
        else if (!!rc !== !!c.rc || (rc && (Math.abs(rc.x - c.rc.x) > 40 || Math.abs(rc.y - c.rc.y) > 40))) again = true;
      }
      if (again || (stale && now - lastAt > 700)) {
        picked = choose(R, obst, boxesOf(spec.surface, H), hw, hh, top);
        lastAt = now; stale = false;
        if (!picked) {
          // Nowhere that clears the target: sit in the corner farthest from it, with no line.
          note.style.width = NOTE_W + 'px';
          var fw = note.offsetWidth || NOTE_W, fh = note.offsetHeight || 80;
          var right = !R || R.x + R.w / 2 < hw / 2, low = !R || R.y + R.h / 2 < hh / 2;
          picked = { x: right ? hw - fw - MARGIN : MARGIN, y: low ? hh - fh - MARGIN : top, W: fw, Nh: fh, cost: 1e9, near: false };
        }
        // A note that is already well placed stays put when the page changes under it a little.
        if (!again && c && picked.cost + 6 >= scoreAt(c, R)) picked = null;
        if (picked) cache = c = { id: spec.id, hw: hw, hh: hh, top: top, x: picked.x, y: picked.y, W: picked.W, Nh: picked.Nh, rc: rc, near: picked.near };
      }
      x = c.x; y = c.y; W = c.W; Nh = c.Nh; side = c.near; note.style.width = W + 'px';
    }
    if (manual && manual.id === spec.id) { x = manual.x; y = manual.y; side = true; }
    note.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    if (side && R && spec.line !== false) {
      var l = link({ x: x, y: y, w: W, h: Nh }, R);
      line.setAttribute('d', 'M' + l[0].toFixed(1) + ' ' + l[1].toFixed(1) + ' L' + l[2].toFixed(1) + ' ' + l[3].toFixed(1));
      dot.setAttribute('cx', l[2].toFixed(1)); dot.setAttribute('cy', l[3].toFixed(1)); dot.setAttribute('r', '3');
    } else { line.removeAttribute('d'); dot.setAttribute('r', '0'); }
  }

  /* The visitor can move the note out of the way: press anywhere on it but its buttons and drag. It stays where it was put until
     the step changes. */
  var manual = null, grab = null;
  function startDrag(e) {
    if (e.button !== 0 || !spec || note.classList.contains('is-dock') || e.target.closest('button, a')) return;
    var H = layer.getBoundingClientRect(), sx = H.width / (layer.clientWidth || H.width) || 1, sy = H.height / (layer.clientHeight || H.height) || 1;
    var r = note.getBoundingClientRect();
    grab = { id: spec.id, dx: e.clientX - r.left, dy: e.clientY - r.top, sx: sx, sy: sy, pid: e.pointerId };
    try { note.setPointerCapture(e.pointerId); } catch (x) {}
    note.classList.add('is-drag');
    note.addEventListener('pointermove', moveDrag);
    note.addEventListener('pointerup', endDrag);
    note.addEventListener('pointercancel', endDrag);
    e.preventDefault();
  }
  function moveDrag(e) {
    if (!grab || !spec) return;
    var H = layer.getBoundingClientRect(), hw = layer.clientWidth, hh = layer.clientHeight, W = note.offsetWidth, Nh = note.offsetHeight;
    var x = (e.clientX - grab.dx - H.left) / grab.sx, y = (e.clientY - grab.dy - H.top) / grab.sy;
    manual = { id: grab.id, x: Math.max(0, Math.min(x, hw - W)), y: Math.max(0, Math.min(y, hh - Nh)) };
    schedule();
  }
  function endDrag() {
    grab = null;
    note.classList.remove('is-drag');
    note.removeEventListener('pointermove', moveDrag);
    note.removeEventListener('pointerup', endDrag);
    note.removeEventListener('pointercancel', endDrag);
  }

  /* ---- where the note goes ----
     The note should sit close to what it is about and cover as little of the app as it can, because a visitor should be able to
     read all of it. It looks at the text and controls the app is showing, scores every place around the target by how much of that
     it would cover and how far it is from the target, and takes the best. It never covers a ring. The choice is made once per step
     (and again if the target moves a long way, the note no longer fits, or the page changes and the note is clearly worse placed). */
  var cache = null, stale = true, lastAt = 0, watcher = null, watching = null;
  /* The app redraws as the visitor works; when it does, the note checks again that it is not in the way. */
  function watch(root) {
    if (root === watching) return;
    if (watcher) watcher.disconnect();
    watching = root;
    if (!root || !('MutationObserver' in window)) return;
    if (!watcher) watcher = new MutationObserver(function () { stale = true; schedule(); });
    watcher.observe(root, { childList: true, subtree: true, characterData: true });
  }

  function hits(x, y, w, h, o) { return x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y; }
  function gapOf(x, y, w, h, o) {
    var dx = Math.max(o.x - (x + w), x - (o.x + o.w), 0), dy = Math.max(o.y - (y + h), y - (o.y + o.h), 0);
    return Math.hypot(dx, dy);
  }
  /* Boxes of everything the app is showing that a person reads or presses, in the layer's coordinates, cut by what clips them. */
  function boxesOf(root, H) {
    var out = [], clips = new Map();
    if (!root) return out;
    layer.style.visibility = 'hidden';
    try { return collect(); } finally { layer.style.visibility = ''; }
    function collect() {
    function clipOf(el) {
      if (!el || el === root.parentNode) return null;
      if (clips.has(el)) return clips.get(el);
      var up = clipOf(el.parentElement), cs = getComputedStyle(el), c = up;
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflowY)) {
        var b = el.getBoundingClientRect(), r = { l: b.left, t: b.top, r: b.right, b: b.bottom };
        c = up ? { l: Math.max(up.l, r.l), t: Math.max(up.t, r.t), r: Math.min(up.r, r.r), b: Math.min(up.b, r.b) } : r;
      }
      clips.set(el, c);
      return c;
    }
    // Words count whole (a title with its first letters under the note cannot be read), controls only where they are touched.
    // A control as big as a row is only a frame for words that are counted on their own.
    // What lies under the assistant, a sheet or the palette is not on show, so it does not count. The note's own layer is looked through.
    function shown(el, l, t, rr, b) {
      var cx = (l + rr) / 2, cy = (t + b) / 2;
      if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return true;
      var hit = document.elementFromPoint(cx, cy);
      return !hit || el.contains(hit);
    }
    function add(r, c, text, el) {
      var l = r.left, t = r.top, rr = r.right, b = r.bottom;
      if (c) { l = Math.max(l, c.l); t = Math.max(t, c.t); rr = Math.min(rr, c.r); b = Math.min(b, c.b); }
      if (rr - l < 1 || b - t < 1) return;
      var w = (rr - l) / H.sx, h = (b - t) / H.sy;
      if (!text && w * h > 4000) return;
      if (!shown(el, l, t, rr, b)) return;
      out.push({ x: (l - H.left) / H.sx, y: (t - H.top) / H.sy, w: w, h: h, t: text ? 1 : 0 });
    }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), range = document.createRange(), n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      var p = n.parentElement;
      if (!p || p.closest('.w-toast, [hidden]')) continue;
      range.selectNodeContents(n);
      var rs = range.getClientRects(), c = clipOf(p);
      for (var i = 0; i < rs.length; i++) add(rs[i], c, true, p);
    }
    root.querySelectorAll('button, select, input, textarea, svg, .w-chip, .w-dot, .w-av, .w-strip i').forEach(function (el) {
      if (el.closest('.w-toast, [hidden]')) return;
      add(el.getBoundingClientRect(), clipOf(el.parentElement), false, el);
    });
    return out;
    }
  }
  /* What the note would cost the visitor, in points: twenty-four for each piece of text it covers (a few letters is enough to make it
     unreadable), less for a control it only touches. */
  function coverOf(x, y, w, h, boxes) {
    var sum = 0;
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i], ox = Math.min(x + w, b.x + b.w) - Math.max(x, b.x);
      if (ox <= 0) continue;
      var oy = Math.min(y + h, b.y + b.h) - Math.max(y, b.y);
      if (oy <= 0) continue;
      var frac = ox * oy / (b.w * b.h);
      sum += b.t ? (frac > 0.1 ? 24 : frac * 24) : frac * 12;
    }
    return sum;
  }
  var lastBoxes = null;
  function choose(R, obst, boxes, hw, hh, top) {
    lastBoxes = boxes;
    var best = null, ref = R || { x: hw - 30, y: hh - 30, w: 0, h: 0 };
    [NOTE_W, 216].forEach(function (W, wi) {
      note.style.width = W + 'px';
      var Nh = note.offsetHeight || 80;
      function consider(x, y, canon) {
        x = Math.max(MARGIN, Math.min(x, hw - W - MARGIN)); y = Math.max(top, Math.min(y, hh - Nh - MARGIN));
        for (var i = 0; i < obst.length; i++) if (hits(x - 4, y - 4, W + 8, Nh + 8, obst[i])) return;
        var gap = gapOf(x, y, W, Nh, ref);
        if (R && gap > 340) return;
        var cost = coverOf(x, y, W, Nh, boxes) + Math.max(gap, GAP) / 6 + (canon ? 0 : 1.5) + wi * 3;
        if (!best || cost < best.cost) best = { x: x, y: y, W: W, Nh: Nh, cost: cost, near: !!R };
      }
      if (R) {
        var mx = R.x + R.w / 2, my = R.y + R.h / 2;
        for (var k = -3; k <= 3; k++) {
          var oy = my - Nh / 2 + k * Nh * 0.35, ox = mx - W / 2 + k * W * 0.4;
          consider(R.x + R.w + GAP, oy, true); consider(R.x - GAP - W, oy, true);
          consider(ox, R.y + R.h + GAP, true); consider(ox, R.y - GAP - Nh, true);
        }
      } else consider(hw - W - MARGIN, hh - Nh - MARGIN, true);
      for (var gx = MARGIN; gx <= hw - W - MARGIN; gx += 24) for (var gy = top; gy <= hh - Nh - MARGIN; gy += 24) consider(gx, gy, false);
    });
    return best;
  }
  function scoreAt(c, R) {
    var boxes = lastBoxes || [];
    var ref = R || { x: c.hw - 30, y: c.hh - 30, w: 0, h: 0 };
    return coverOf(c.x, c.y, c.W, c.Nh, boxes) + Math.max(gapOf(c.x, c.y, c.W, c.Nh, ref), GAP) / 6;
  }
  /* The shortest straight line between the note and the ring, from the note's edge to a point inside the ring's edge. */
  function link(N, R) {
    var ox0 = Math.max(N.x, R.x), ox1 = Math.min(N.x + N.w, R.x + R.w), oy0 = Math.max(N.y, R.y), oy1 = Math.min(N.y + N.h, R.y + R.h);
    var rcx = R.x + R.w / 2, rcy = R.y + R.h / 2;
    function cl(v, a, b) { return Math.min(Math.max(v, a), b); }
    if (ox1 > ox0 + 12) {
      var vx = cl(rcx, ox0 + 6, ox1 - 6), below = N.y > R.y + R.h / 2;
      return [vx, below ? N.y : N.y + N.h, vx, below ? R.y + R.h : R.y];
    }
    if (oy1 > oy0 + 12) {
      var hy = cl(rcy, oy0 + 6, oy1 - 6), rightOf = N.x > R.x + R.w / 2;
      return [rightOf ? N.x : N.x + N.w, hy, rightOf ? R.x + R.w : R.x, hy];
    }
    var nx = N.x > R.x ? N.x : N.x + N.w, ny = N.y > R.y ? N.y : N.y + N.h;
    var tx = N.x > R.x ? R.x + R.w : R.x, ty = N.y > R.y ? R.y + R.h : R.y;
    return [nx, ny, tx, ty];
  }
  /* The phone case: the note keeps to one side of the device. */
  function besideDevice(R, K, W, Nh, hw, hh, top) {
    var x, y, side = false;
    function cx(v) { return Math.max(MARGIN, Math.min(v, hw - W - MARGIN)); }
    function cy(v) { return Math.max(top, Math.min(v, hh - Nh - MARGIN)); }
    function clear(px, py) { return px + W <= K.x - 6 || px >= K.x + K.w + 6 || py + Nh <= K.y || py >= K.y + K.h; }
    function fits(px, py) { return px >= MARGIN - 1 && py >= top - 1 && px + W <= hw - MARGIN + 1 && py + Nh <= hh - MARGIN + 1 && clear(px, py); }
    if (R) {
      var mx = R.x + R.w / 2, my = R.y + R.h / 2;
      var c = { right: [K.x + K.w + GAP, cy(my - Nh / 2)], left: [K.x - GAP - W, cy(my - Nh / 2)] };
      var order = mx > K.x + K.w / 2 ? ['right', 'left'] : ['left', 'right'];
      order.some(function (s) { if (fits(c[s][0], c[s][1])) { side = true; x = c[s][0]; y = c[s][1]; return true; } });
    }
    if (!side) {
      var right = !R || R.x + R.w / 2 < hw / 2, low = !R || R.y + R.h / 2 < hh / 2;
      x = right ? hw - W - MARGIN : MARGIN; y = low ? hh - Nh - MARGIN : top;
    }
    return { x: x, y: y, side: side };
  }

  // Track layout shifts, scaled devices and scrolling in the same coordinate space as the ring.
  function track() { place(); if (spec) frame = requestAnimationFrame(track); }
  function schedule() { if (spec && !frame) frame = requestAnimationFrame(track); }

  window.WBGuide = {
    /* s: { id, kicker, text, els: [elements, the first is the one the line goes to], kind: 'press' | 'area', actions: [{key, label, primary, href}],
            host: where the layer lives, dock: an element to dock the note in (small screens) or null,
            cover: bars that float over the app's content, which a ring must not run under } */
    show: function (s) {
      if (!spec || spec.id !== s.id) manual = null;
      spec = s; misses = 0;
      build(s.host);
      watch(s.surface);
      layer.classList.remove('is-off');
      var wantDock = !!s.dock;
      if (wantDock) { if (note.parentNode !== s.dock.parent) s.dock.parent.insertBefore(note, s.dock.before); }
      else if (note.parentNode !== layer) layer.appendChild(note);
      note.classList.toggle('is-dock', wantDock);
      fill(s);
      schedule();
    },
    hide: function () {
      spec = null; shown = ''; cancelAnimationFrame(frame); frame = 0; clearTimeout(retry); watch(null); cache = null;
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
