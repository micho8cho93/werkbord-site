/* Shared behaviour: the WB helpers used by the demo. The theme follows the demo's own switch in the app rail. No dependencies. */
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
})();
