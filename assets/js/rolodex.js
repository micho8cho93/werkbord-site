/* The word after "a local-first" in the headline: team, agent or project. Each word is a card on the same slot. The card
   on show folds away upward and the next one comes up from below, like a rolodex. The slot is as wide as the word it
   shows, so "workspace" moves with it and the line never breaks. The page holds one card in its markup; this script adds
   the rest. Reduced motion holds on the first word, and the cards pause while the tab is hidden. */
(function () {
  'use strict';
  var box = document.querySelector('.rolo');
  if (!box) return;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var faces = [box.querySelector('.rolo-w')];
  var HOLD = 3000;
  var cur = 0, timer = 0;

  /* The other words are drawn by CSS from data-w, so the headline's text stays "team workspace" for search engines. */
  box.getAttribute('data-words').split(' ').slice(1).forEach(function (word) {
    var f = document.createElement('span');
    f.className = 'rolo-w';
    f.setAttribute('aria-hidden', 'true');
    f.setAttribute('data-w', word);
    box.appendChild(f);
    faces.push(f);
  });

  /* Widths are kept in em, so they hold at any size of headline. */
  function measure() {
    var size = parseFloat(getComputedStyle(box).fontSize);
    faces.forEach(function (f) { f.dataset.em = (parseFloat(getComputedStyle(f).width) / size).toFixed(3); });
    box.style.width = faces[cur].dataset.em + 'em';
  }

  function flip() {
    if (document.hidden) return;
    var out = faces[cur];
    cur = (cur + 1) % faces.length;
    var word = faces[cur];
    out.classList.remove('is-on');
    out.classList.add('is-out');
    out.setAttribute('aria-hidden', 'true');
    /* The card that comes in starts below the line. It left above it last time, so it is moved back without a transition. */
    word.style.transition = 'none';
    word.classList.remove('is-out');
    void word.offsetWidth;
    word.style.transition = '';
    word.classList.add('is-on');
    word.removeAttribute('aria-hidden');
    box.classList.add('is-ready');
    box.style.width = word.dataset.em + 'em';
  }

  function start() {
    clearInterval(timer);
    if (!still.matches) timer = setInterval(flip, HOLD);
  }

  measure();
  if (document.fonts) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);
  still.addEventListener('change', start);
  start();
})();
