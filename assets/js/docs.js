(function () {
  'use strict';
  var menu = document.querySelector('.docs-menu');
  var mobile = matchMedia('(max-width: 760px)');
  function fitMenu() { menu.open = !mobile.matches; }
  fitMenu();
  mobile.addEventListener('change', fitMenu);
  var input = document.getElementById('docs-search');
  var results = document.getElementById('search-results');
  var nav = document.getElementById('docs-nav');
  var index = null, loading = null;
  function loadIndex() {
    if (!loading) loading = fetch('search-index.json').then(function (r) {
      if (!r.ok) throw new Error('Search unavailable');
      return r.json();
    }).then(function (data) { index = data; }).catch(function () { loading = null; });
    return loading;
  }
  function search() {
    var query = input.value.trim().toLowerCase();
    results.hidden = !query;
    nav.hidden = !!query;
    var list = results.querySelector('ul');
    list.replaceChildren();
    if (!query) return;
    if (!index) {
      results.querySelector('.search-status').textContent = 'Search is unavailable. Browse the topics below.';
      nav.hidden = false;
      return;
    }
    var terms = query.split(/\s+/);
    var hits = index.filter(function (page) {
      var text = (page.title + ' ' + page.summary + ' ' + page.text).toLowerCase();
      return terms.every(function (term) { return text.includes(term); });
    }).sort(function (a, b) { return Number(b.title.toLowerCase().includes(query)) - Number(a.title.toLowerCase().includes(query)); });
    results.querySelector('.search-status').textContent = hits.length ? hits.length + (hits.length === 1 ? ' page' : ' pages') + ' found' : 'No results. Try “phone”, “review”, or “setup”.';
    hits.forEach(function (page) {
      var li = document.createElement('li'), a = document.createElement('a'), title = document.createElement('strong'), detail = document.createElement('span');
      a.href = page.url; title.textContent = page.title; detail.textContent = page.summary;
      a.append(title, detail); li.appendChild(a); list.appendChild(li);
    });
  }
  input.addEventListener('focus', loadIndex);
  input.addEventListener('input', function () { loadIndex().then(search); });
  document.addEventListener('keydown', function (e) {
    var editing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === '/' && !editing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); menu.open = true; input.focus(); }
    if (e.key === 'Escape' && document.activeElement === input) { input.value = ''; search(); input.blur(); }
  });
  if ('IntersectionObserver' in window) {
    var outline = document.querySelector('.doc-outline');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        outline.querySelectorAll('a').forEach(function (link) {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-90px 0px -55% 0px' });
    document.querySelectorAll('.doc-article section').forEach(function (section) { observer.observe(section); });
  }
})();
/* Annotated screenshots: a note and its box light up together; a click enlarges the picture. */
(function () {
  'use strict';
  document.querySelectorAll('figure.shot').forEach(function (fig) {
    function light(n, on) { fig.querySelectorAll('[data-pin="' + n + '"]').forEach(function (el) { el.classList.toggle('on', on); }); }
    fig.querySelectorAll('.pin-notes li').forEach(function (li) {
      li.addEventListener('mouseenter', function () { light(li.dataset.pin, true); });
      li.addEventListener('mouseleave', function () { light(li.dataset.pin, false); });
    });
    var btn = fig.querySelector('.shot-img');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = fig.classList.toggle('zoom');
      document.documentElement.style.overflow = open ? 'hidden' : '';
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var z = document.querySelector('figure.shot.zoom');
    if (z) { z.classList.remove('zoom'); document.documentElement.style.overflow = ''; }
  });
})();
