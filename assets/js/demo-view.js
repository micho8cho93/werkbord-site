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
  var behind = document.querySelectorAll('.skip, .top, .hero, .wl-sec, .foot, #demo .demo-head, #demo .demo-switch, #demo [data-panel="desktop"]');
  var full = false;

  /* Desktop or Phone: shows one simulator and refits it, since a hidden one has no size yet. */
  function setView(name) {
    section.setAttribute('data-view', name);
    views.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view-button') === name)); });
    WBApp.refit();
  }
  window.addEventListener('wb-demo-view', function (e) { setView(e.detail); if (small.matches) openFull(); });
  views.forEach(function (b) {
    b.addEventListener('click', function () { setView(b.getAttribute('data-view-button')); });
  });

  function openFull() {
    if (full) return;
    full = true;
    phone.classList.add('is-full');
    phone.setAttribute('role', 'dialog');
    phone.setAttribute('aria-modal', 'true');
    phone.setAttribute('aria-label', 'werkbord demo on a phone');
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

  var welcome = section.querySelector('.demo-welcome-wrap');
  var welcomed = false;
  try { welcomed = sessionStorage.getItem('wb-demo-welcomed') === 'yes'; } catch (e) {}
  var demoControls = section.querySelectorAll('.demo-panel, .demo-switch, [data-guide]');
  function showWelcome(show) {
    welcome.hidden = !show;
    demoControls.forEach(function (el) { el.inert = show; });
  }
  function dismissWelcome() {
    welcomed = true;
    try { sessionStorage.setItem('wb-demo-welcomed', 'yes'); } catch (e) {}
    showWelcome(false);
  }
  if (welcome) {
    if (!welcomed) showWelcome(true);
    welcome.querySelector('[data-welcome-start]').addEventListener('click', function () {
      dismissWelcome();
      if (small.matches) openFull();
      WBApp.startGuide();
      if (!small.matches) section.querySelector('[data-guide-restart]').focus({ preventScroll: true });
    });
    welcome.querySelector('[data-welcome-explore]').addEventListener('click', function () {
      dismissWelcome();
      (small.matches ? openBtn : section.querySelector('[data-guide-restart]')).focus({ preventScroll: true });
    });
    welcome.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { dismissWelcome(); openBtn.getClientRects().length ? openBtn.focus() : section.querySelector('[data-guide-restart]').focus(); }
    });
  }
  openBtn.addEventListener('click', function () {
    if (welcome && !welcome.hidden) { welcome.scrollIntoView({ block: 'center' }); welcome.querySelector('[data-welcome-start]').focus({ preventScroll: true }); }
    else openFull();
  });
  backBtn.addEventListener('click', function () { closeFull(true); });
  section.querySelector('[data-phone-guide]').addEventListener('click', function () { WBApp.startGuide(); });

  /* Escape closes the open layer of the demo first (app-demo.js does that and stops the key there). With nothing open, it returns to the launch page. */
  document.addEventListener('keydown', function (e) {
    if (!full) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeFull(true); return; }
    if (e.key !== 'Tab') return;
    var focusable = Array.from(phone.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')).filter(function (el) {
      return !el.disabled && !el.closest('[inert]') && el.getClientRects().length;
    });
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (!first) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, true);

  /* Growing back to a wide screen leaves the full-screen phone; the switch takes over again. */
  small.addEventListener('change', function () {
    if (!small.matches) closeFull(false);
    WBApp.refit();
  });

})();
