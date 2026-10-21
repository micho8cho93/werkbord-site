/* The demo's controls on the launch page. From 768px one simulator shows at a time: the desktop window or the phone,
   picked with the Desktop and Phone switch. Below 768px the site is two pages: the launch page, which fits the screen, and the
   demo. Try the demo (in the header) opens the demo page on the card that says what werkbord is; Start walkthrough there begins
   the guided demo, and I'll explore opens the phone app full screen with no guide. Back returns to the launch page. The apps and
   their data come from app-demo.js; this file only shows and hides them. */
(function () {
  'use strict';
  var section = document.getElementById('demo');
  if (!section || !window.WBApp) return;

  var small = window.matchMedia('(max-width: 767px)');
  var phone = section.querySelector('[data-panel="phone"]');
  var openBtn = document.querySelector('[data-open-phone]');
  var backBtn = section.querySelector('[data-close-phone]');
  var views = section.querySelectorAll('[data-view-button]');
  var behind = document.querySelectorAll('.skip, .top, .hero, .wl-sec, .foot, #demo .demo-head, #demo .demo-switch, #demo [data-panel="desktop"]');
  var full = false, pageOpen = false;
  /* On a phone, whatever page is open locks the one behind it: no scrolling, and nothing on it can be reached. */
  function lockBehind() {
    var on = small.matches && (full || pageOpen);
    behind.forEach(function (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    document.body.classList.toggle('demo-locked', on);
  }

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
    lockBehind();
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
    lockBehind();
    WBApp.refit();
    if (restoreFocus) openBtn.focus();
  }

  var welcome = section.querySelector('.demo-welcome-wrap');
  var welcomed = false;
  try { welcomed = sessionStorage.getItem('wb-demo-welcomed') === 'yes'; } catch (e) {}
  var demoControls = section.querySelectorAll('.demo-panel, .demo-switch, [data-guide]');
  /* Wide: the card sits over the demo until a choice is made. Narrow: it is a page of its own, shown only once Try the demo is pressed. */
  function syncWelcome() {
    if (!welcome) return;
    var show = small.matches ? pageOpen : !welcomed;
    welcome.hidden = !show;
    welcome.classList.toggle('is-page', small.matches && pageOpen);
    demoControls.forEach(function (el) { el.inert = show && !small.matches; });
    lockBehind();
  }
  function dismissWelcome() {
    welcomed = true;
    pageOpen = false;
    try { sessionStorage.setItem('wb-demo-welcomed', 'yes'); } catch (e) {}
    syncWelcome();
  }
  function openWelcomePage() {
    pageOpen = true;
    syncWelcome();
    welcome.scrollTop = 0;
    welcome.querySelector('[data-welcome-start]').focus({ preventScroll: true });
  }
  function closeWelcomePage() {
    pageOpen = false;
    syncWelcome();
    openBtn.focus({ preventScroll: true });
  }
  if (welcome) {
    syncWelcome();
    welcome.querySelector('[data-welcome-start]').addEventListener('click', function () {
      dismissWelcome();
      if (small.matches) openFull();
      WBApp.startGuide();
      if (!small.matches) section.querySelector('[data-guide-restart]').focus({ preventScroll: true });
    });
    welcome.querySelector('[data-welcome-explore]').addEventListener('click', function () {
      dismissWelcome();
      if (small.matches) openFull(); else section.querySelector('[data-guide-restart]').focus({ preventScroll: true });
    });
    welcome.querySelector('[data-welcome-back]').addEventListener('click', closeWelcomePage);
    welcome.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (small.matches) { e.preventDefault(); closeWelcomePage(); return; }
      dismissWelcome(); openBtn.getClientRects().length ? openBtn.focus() : section.querySelector('[data-guide-restart]').focus();
    });
  }
  openBtn.addEventListener('click', function () {
    if (welcome && !welcomed) openWelcomePage();
    else openFull();
  });
  backBtn.addEventListener('click', function () { closeFull(true); });
  section.querySelector('[data-phone-guide]').addEventListener('click', function () { WBApp.startGuide(); });

  /* Escape closes the open layer of the demo first (app-demo.js does that and stops the key there). With nothing open, it returns to the launch page. */
  document.addEventListener('keydown', function (e) {
    var page = full ? phone : small.matches && pageOpen ? welcome : null;
    if (!page) return;
    if (full && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeFull(true); return; }
    if (e.key !== 'Tab') return;
    var focusable = Array.from(page.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')).filter(function (el) {
      return !el.disabled && !el.closest('[inert]') && el.getClientRects().length;
    });
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (!first) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, true);

  /* Growing back to a wide screen leaves the pages of a phone; the switch takes over again. Turning back to a narrow one shows the launch page. */
  small.addEventListener('change', function () {
    pageOpen = false;
    if (!small.matches) closeFull(false);
    syncWelcome();
    WBApp.refit();
  });

})();
