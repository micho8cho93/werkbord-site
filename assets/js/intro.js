/* A finite entry sequence. Internal navigation and reduced motion skip it. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = matchMedia('(prefers-reduced-motion: reduce)');
  var nav = performance.getEntriesByType('navigation')[0];
  var internal = false;
  try { internal = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
  if (motion.matches || (internal && (!nav || nav.type !== 'reload')) || (nav && nav.type === 'back_forward')) return;
  root.classList.add('intro-pending');

  var raf = 0, canvas, ctx, start, width, height, dpr, closed = false;
  function finish() {
    closed = true;
    cancelAnimationFrame(raf);
    root.classList.remove('intro-pending');
    var intro = document.querySelector('.intro');
    if (intro) intro.remove();
    window.removeEventListener('keydown', finish);
    window.removeEventListener('pointerdown', finish);
    window.removeEventListener('resize', size);
    window.removeEventListener('pageshow', restored);
    document.removeEventListener('visibilitychange', hidden);
    motion.removeEventListener('change', finish);
  }
  function restored(e) { if (e.persisted) finish(); }
  function hidden() { if (document.hidden) finish(); }
  function size() {
    if (!canvas) return;
    width = window.innerWidth; height = window.innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
  }
  function draw(now) {
    if (closed) return;
    var elapsed = now - start;
    if (elapsed > 1950) return finish();
    var dark = root.dataset.theme === 'dark', pitch = width < 600 ? 20 : 26, cell = pitch - 4;
    var cols = Math.ceil(width / pitch), rows = Math.ceil(height / pitch);
    var ox = (width - cols * pitch) / 2, oy = (height - rows * pitch) / 2;
    var mark = document.querySelector('.intro-mark-space').getBoundingClientRect();
    var markPitch = mark.width / 11, markCell = markPitch * .85;
    var colors = dark ? ['#F0F0EC', '#7C93FF', '#E0A84A'] : ['#0A0A0A', '#2447FF', '#F2A93B'];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = dark ? '#1D1D1F' : '#E9E9E4';
    ctx.globalAlpha = .55;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      ctx.fillRect(ox + c * pitch, oy + r * pitch, cell, cell);
    }
    for (var bar = 0; bar < 3; bar++) for (var y = 0; y < 8; y++) for (var k = 0; k < 2; k++) {
      var age = Math.max(0, Math.min(1, (elapsed - 120 - bar * 100 - y * 35) / 200));
      ctx.globalAlpha = age;
      ctx.fillStyle = colors[bar];
      var x = bar * 3 + 3 - Math.floor(y / 2) + k;
      ctx.fillRect(mark.left + x * markPitch, mark.top + y * markPitch, markCell, markCell);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }
  // The timeout and CSS exit both keep a failed or delayed script from hiding the site.
  setTimeout(finish, 2600);
  window.addEventListener('keydown', finish);
  window.addEventListener('pointerdown', finish);
  window.addEventListener('pageshow', restored);
  document.addEventListener('visibilitychange', hidden);
  motion.addEventListener('change', finish);
  document.addEventListener('DOMContentLoaded', function () {
    if (closed) return;
    canvas = document.getElementById('intro-grid');
    if (!canvas || !(ctx = canvas.getContext('2d'))) return finish();
    start = performance.now();
    size();
    window.addEventListener('resize', size);
    raf = requestAnimationFrame(draw);
  }, { once: true });
})();
