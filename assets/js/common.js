/* Shared behaviour: the WB helpers used by the demo, and the theme toggle. No dependencies. */
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
})();
