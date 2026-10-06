/* The Mac download buttons.
 *
 * Every [data-mac-download] is an ordinary link to the newest disk image,
 *   https://github.com/micho8cho93/werkbord/releases/latest/download/Werkbord.dmg
 * which works with no script, and in a new tab, and is what a search engine and a screen reader see.
 *
 * This makes it honest in one case: the Mac app is published with a release, and until a release carries it that
 * address finds nothing. When someone CLICKS (not before: the page makes no request to GitHub when it loads), the
 * newest release is looked at; if it has the disk image the click goes on to the download, and if it does not, the
 * person is told so, and sent to the command line installer, which works. If GitHub cannot be asked (offline, rate
 * limited) the link is simply followed. Nothing is stored, and nothing is sent but the request itself.
 */
(function () {
  'use strict';
  var links = document.querySelectorAll('[data-mac-download]');
  if (!links.length || !window.fetch) return;
  var API = 'https://api.github.com/repos/micho8cho93/werkbord/releases/latest';

  function say(text) {
    document.querySelectorAll('[data-mac-note]').forEach(function (n) {
      n.textContent = text;
      n.hidden = !text;
    });
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      // a new tab, a download-as, the middle button: the browser's own business
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      say('');
      fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)); })
        .then(function (release) {
          var has = (release.assets || []).some(function (a) { return a.name === 'Werkbord.dmg'; });
          if (has) {
            window.location.href = link.href;
          } else {
            say('The Mac app is not published yet. The command line installer below works on any Mac today.');
          }
        })
        .catch(function () {
          window.location.href = link.href;
        });
    });
  });
})();
