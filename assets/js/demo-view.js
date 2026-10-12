/* The demo's controls on the launch page. Screens 768px and wider switch between the Desktop window and
   the Phone at true phone width. Smaller screens open the phone app full screen from Try the demo, with a
   Back control to return. The apps and their data come from app-demo.js; this file only shows and hides them. */
(function () {
  'use strict';
  var section = document.getElementById('demo');
  if (!section || !window.WBApp) return;

  var small = window.matchMedia('(max-width: 767px)');
  var phone = section.querySelector('[data-panel="phone"]');
  var openBtn = section.querySelector('[data-open-phone]');
  var backBtn = section.querySelector('[data-close-phone]');
  var views = section.querySelectorAll('[data-view-button]');
  var behind = document.querySelectorAll('.top, .wl-sec, .foot, #demo .demo-head, #demo [data-panel="desktop"]');
  var full = false;

  function setView(name) {
    section.setAttribute('data-view', name);
    views.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view-button') === name)); });
    WBApp.refit();
  }
  views.forEach(function (b) {
    b.addEventListener('click', function () { setView(b.getAttribute('data-view-button')); });
  });

  function openFull() {
    if (full) return;
    full = true;
    phone.classList.add('is-full');
    phone.setAttribute('role', 'dialog');
    phone.setAttribute('aria-modal', 'true');
    phone.setAttribute('aria-label', 'Werkbord demo on a phone');
    behind.forEach(function (el) { el.setAttribute('inert', ''); });
    document.body.classList.add('demo-locked');
    WBApp.refit();
    backBtn.focus();
  }

  function closeFull(restoreFocus) {
    if (!full) return;
    full = false;
    phone.classList.remove('is-full');
    phone.removeAttribute('role');
    phone.removeAttribute('aria-modal');
    phone.removeAttribute('aria-label');
    behind.forEach(function (el) { el.removeAttribute('inert'); });
    document.body.classList.remove('demo-locked');
    WBApp.refit();
    if (restoreFocus) openBtn.focus();
  }

  openBtn.addEventListener('click', openFull);
  backBtn.addEventListener('click', function () { closeFull(true); });

  /* Escape closes the demo, unless the phone app has its own sheet or task open: that one closes first. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && full && !phone.querySelector('.w-mtask, .w-sheet, .w-pal')) closeFull(true);
  }, true);

  /* Growing back to a wide screen leaves the full-screen phone; the Desktop and Phone switch takes over. */
  small.addEventListener('change', function () {
    if (!small.matches) closeFull(false);
    WBApp.refit();
  });

  /* The four quick actions drive the desktop window, so they bring it forward first. */
  section.querySelectorAll('[data-try]').forEach(function (b) {
    b.addEventListener('click', function () {
      setView('desktop');
      document.getElementById('app-demo').scrollIntoView({ block: 'center', behavior: WB.reduced ? 'auto' : 'smooth' });
      WBApp.go(b.getAttribute('data-try'));
    });
  });
})();
