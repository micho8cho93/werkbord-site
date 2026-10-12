/* The demo's controls on the launch page. From 768px one simulator shows at a time: the desktop window or the phone,
   picked with the Desktop and Phone switch. Below 768px the phone app opens full screen from Try the demo, with a Back
   control to return. The apps and their data come from app-demo.js; this file only shows and hides them. */
(function () {
  'use strict';
  var section = document.getElementById('demo');
  if (!section || !window.WBApp) return;

  var small = window.matchMedia('(max-width: 767px)');
  var phone = section.querySelector('[data-panel="phone"]');
  var openBtn = section.querySelector('[data-open-phone]');
  var backBtn = section.querySelector('[data-close-phone]');
  var views = section.querySelectorAll('[data-view-button]');
  var behind = document.querySelectorAll('.top, .hero, .wl-sec, .foot, #demo .demo-head, #demo .demo-switch, #demo [data-panel="desktop"]');
  var full = false;

  /* Desktop or Phone: shows one simulator and refits it, since a hidden one has no size yet. */
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
    if (e.key === 'Escape' && full && !phone.querySelector('.w-asst, .w-mtask, .w-sheet, .w-pal')) closeFull(true);
  }, true);

  /* Growing back to a wide screen leaves the full-screen phone; the switch takes over again. */
  small.addEventListener('change', function () {
    if (!small.matches) closeFull(false);
    WBApp.refit();
  });

  /* The four quick actions sit under the switch. In the Phone view they run on the phone, so the visitor sees the
     phone's version of the action; otherwise they show the desktop window first. */
  section.querySelectorAll('[data-try]').forEach(function (b) {
    b.addEventListener('click', function () {
      var what = b.getAttribute('data-try'), scroll = { block: 'nearest', behavior: WB.reduced ? 'auto' : 'smooth' };
      if (section.getAttribute('data-view') === 'phone') {
        WBApp.go(what, 'phone');
        document.getElementById('phone-demo').scrollIntoView(scroll);
        return;
      }
      setView('desktop');
      document.getElementById('app-demo').scrollIntoView(scroll);
      WBApp.go(what);
    });
  });
})();
