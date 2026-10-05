/* Shared behaviour: theme and copy buttons. No dependencies. */
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

  if (!WB.reduced && 'IntersectionObserver' in window) {
    var accents = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('accent-enter');
          accents.unobserve(entry.target);
        }
      });
    }, { threshold: .8 });
    document.querySelectorAll('.accent-word').forEach(function (el) { accents.observe(el); });
  }

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

})();
