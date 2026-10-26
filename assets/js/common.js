/* Shared behaviour: the WB helpers used by the demo, and the one place Theme and Style are changed. No dependencies.
   The head script has already put data-theme (light|dark) and data-style (graphite|classic, absent for Paper) on <html>.
   The demo's Settings → Appearance calls setTheme / setStyle, so the whole page follows what the visitor picks there. */
(function () {
  'use strict';
  var root = document.documentElement;
  var WB = (window.WB = window.WB || {});
  var THEME_KEY = 'wb-theme', STYLE_KEY = 'wb-style';
  var dark = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;

  WB.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  WB.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function read(key) { try { return localStorage.getItem(key) || ''; } catch (x) { return ''; } }
  function write(key, value) { try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key); } catch (x) { /* kept for this visit only */ } }

  /* What is showing now. */
  WB.theme = function () { return root.dataset.theme === 'dark' ? 'dark' : 'light'; };
  WB.style = function () { return root.dataset.style === 'graphite' || root.dataset.style === 'classic' ? root.dataset.style : 'paper'; };
  /* What the visitor chose: '' is "Device", which follows the computer. */
  WB.themeChoice = function () { var t = read(THEME_KEY); return t === 'light' || t === 'dark' ? t : ''; };

  /* The product's three styles, in its words (web/src/lib/theme.svelte.ts). */
  WB.STYLES = [
    { id: 'paper', label: 'Paper', about: 'Flat and calm, on warm ivory with brown ink. The default.' },
    { id: 'graphite', label: 'Graphite', about: 'Cool blue-greys, an ink primary and a teal accent.' },
    { id: 'classic', label: 'Classic', about: 'The earlier raised buttons and cards, on cool paper.' }
  ];

  /* The browser's own chrome follows the page. */
  function chrome() {
    var m = document.querySelector('meta[name="theme-color"]');
    var c = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (m && c) m.setAttribute('content', c);
  }
  function announce(what) {
    chrome();
    window.dispatchEvent(new Event(what));
  }
  function showTheme() {
    var choice = WB.themeChoice();
    root.dataset.theme = choice || (dark && dark.matches ? 'dark' : 'light');
  }
  function showStyle() {
    var s = read(STYLE_KEY);
    if (s === 'graphite' || s === 'classic') root.dataset.style = s; else delete root.dataset.style;
  }

  /* choice: 'light' | 'dark' | '' (Device). */
  WB.setTheme = function (choice) {
    write(THEME_KEY, choice === 'light' || choice === 'dark' ? choice : '');
    showTheme();
    announce('themechange');
  };
  /* choice: 'paper' | 'graphite' | 'classic'. */
  WB.setStyle = function (choice) {
    write(STYLE_KEY, choice === 'graphite' || choice === 'classic' ? choice : '');
    showStyle();
    announce('stylechange');
  };

  /* "Device" follows the computer while the page is open, and a choice made in another tab of this site reaches this one. */
  if (dark && dark.addEventListener) dark.addEventListener('change', function () { if (!WB.themeChoice()) { showTheme(); announce('themechange'); } });
  window.addEventListener('storage', function (e) {
    if (e.key === THEME_KEY) { showTheme(); announce('themechange'); }
    if (e.key === STYLE_KEY) { showStyle(); announce('stylechange'); }
  });
  chrome();
})();
