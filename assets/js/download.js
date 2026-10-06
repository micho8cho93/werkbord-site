/* Resolve an actual published Mac installer on click. A newer CLI-only release
 * must not hide the last available DMG. Plain links still work without JavaScript.
 */
(function () {
  'use strict';
  var links = document.querySelectorAll('[data-mac-download]');
  if (!links.length || !window.fetch) return;
  var API = 'https://api.github.com/repos/micho8cho93/werkbord/releases';
  var BASE = 'https://github.com/micho8cho93/werkbord/releases/download/';
  var PREVIEW_TAG = 'werkbord-v1.3.1-preview.1';
  var pending = false;

  function say(text) {
    document.querySelectorAll('[data-mac-note]').forEach(function (n) {
      n.textContent = text;
      n.hidden = !text;
    });
  }

  function busy(value) {
    pending = value;
    links.forEach(function (link) {
      if (value) link.setAttribute('aria-busy', 'true');
      else link.removeAttribute('aria-busy');
    });
  }

  function read(url, signal) {
    return fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal: signal })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)); });
  }

  function installer(release) {
    if (release.draft || release.prerelease || !/^werkbord-v\d+\.\d+\.\d+$/.test(release.tag_name)) return null;
    var name = 'Werkbord_' + release.tag_name.slice(10) + '_darwin_universal.dmg';
    var assets = release.assets || [];
    return assets.find(function (a) { return a.name === 'Werkbord.dmg' && a.state === 'uploaded' && a.size > 0 && a.browser_download_url === BASE + release.tag_name + '/Werkbord.dmg'; }) ||
      assets.find(function (a) { return a.name === name && a.state === 'uploaded' && a.size > 0 && a.browser_download_url === BASE + release.tag_name + '/' + name; });
  }

  function previewInstaller(release) {
    if (release.draft || !release.prerelease || release.tag_name !== PREVIEW_TAG) return null;
    return (release.assets || []).find(function (a) {
      return a.name === 'Werkbord-preview.dmg' && a.state === 'uploaded' && a.size > 0 &&
        a.browser_download_url === BASE + PREVIEW_TAG + '/Werkbord-preview.dmg';
    });
  }

  function newestFirst(a, b) {
    var av = a.tag_name.slice(10).split('.').map(Number);
    var bv = b.tag_name.slice(10).split('.').map(Number);
    return bv[0] - av[0] || bv[1] - av[1] || bv[2] - av[2];
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      // Preserve the browser's new-tab, middle-click and save-link gestures.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (pending) return;
      busy(true);
      say('Finding the Mac installer…');
      var controller = window.AbortController ? new AbortController() : null;
      var timer = controller ? setTimeout(function () { controller.abort(); }, 8000) : null;
      var signal = controller ? controller.signal : undefined;
      read(API + '/latest', signal)
        .then(function (release) {
          var asset = installer(release);
          if (asset) return asset;
          return read(API + '?per_page=100', signal).then(function (releases) {
            var available = releases.filter(function (r) { return installer(r); }).sort(newestFirst);
            if (available.length) return installer(available[0]);
            var preview = releases.find(function (r) { return previewInstaller(r); });
            return preview ? previewInstaller(preview) : null;
          });
        })
        .then(function (asset) {
          if (asset) {
            // Use the asset's own release, rather than racing a changing /latest URL.
            links.forEach(function (l) { l.href = asset.browser_download_url; });
            say(asset.name === 'Werkbord-preview.dmg' ?
              'Starting the unsigned preview download. Open the DMG and drag Werkbord to Applications. If blocked, use Privacy & Security → Open Anyway.' :
              'Starting the DMG download. Check your browser’s downloads.');
            window.location.assign(asset.browser_download_url);
          } else {
            say('The Mac installer is not available yet. Use the command line installer below, or try again after the Mac app is released.');
          }
        })
        .catch(function () {
          // API limits or an unavailable API must not block GitHub's direct download.
          window.location.assign(link.href);
        })
        .finally(function () {
          if (timer) clearTimeout(timer);
          busy(false);
        });
    });
  });
})();
