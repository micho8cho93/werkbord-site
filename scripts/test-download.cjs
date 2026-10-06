const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('assets/js/download.js', 'utf8');
const base = 'https://github.com/micho8cho93/werkbord/releases/download/';
function release(tag, name = 'Werkbord.dmg') {
  return { tag_name: tag, assets: [{ name, state: 'uploaded', size: 123, browser_download_url: base + tag + '/' + name }] };
}
function page(responses) {
  const calls = [], downloads = [], notes = [{ hidden: true }, { hidden: true }];
  const links = [0, 1].map(() => ({
    href: 'https://github.com/micho8cho93/werkbord/releases/download/werkbord-v1.3.1-preview.1/Werkbord-preview.dmg',
    addEventListener(_, fn) { this.click = fn; },
    setAttribute(k, v) { this[k] = v; },
    removeAttribute(k) { delete this[k]; }
  }));
  const fetch = async url => {
    calls.push(url);
    const value = responses.shift();
    if (value instanceof Error) throw value;
    return { ok: true, json: async () => value };
  };
  vm.runInNewContext(source, {
    document: { querySelectorAll: selector => selector === '[data-mac-download]' ? links : notes },
    window: { fetch, location: { assign: url => downloads.push(url) } }, fetch, setTimeout, clearTimeout
  });
  return { calls, downloads, notes, links, click(extra = {}, link = links[0]) {
    let prevented = false;
    link.click({ button: 0, preventDefault() { prevented = true; }, ...extra });
    return prevented;
  } };
}
const settled = () => new Promise(resolve => setImmediate(resolve));
test('uses the latest uploaded DMG’s pinned URL, with no request on load', async () => {
  const r = release('werkbord-v1.3.0'), p = page([r]);
  assert.equal(p.calls.length, 0);
  p.click(); await settled();
  assert.deepEqual(p.downloads, [r.assets[0].browser_download_url]);
  assert.equal(p.links[1].href, p.downloads[0]);
  assert.equal(p.links[0]['aria-busy'], undefined);
});
test('finds the highest stable individual DMG when latest has only CLI archives', async () => {
  const good = release('werkbord-v1.10.0', 'Werkbord_1.10.0_darwin_universal.dmg');
  const p = page([{ tag_name: 'werkbord-v1.11.0', assets: [] }, [
    release('werkbord-team-v9.0.0'), { ...release('werkbord-v8.0.0'), draft: true },
    { ...release('werkbord-v7.0.0'), prerelease: true }, release('werkbord-v6.0.0-rc1'),
    release('werkbord-v1.9.0'), good, release('werkbord-v1.2.0')
  ]]);
  p.click(); await settled();
  assert.deepEqual(p.downloads, [good.assets[0].browser_download_url]);
  assert.equal(p.calls.length, 2);
});
test('does not navigate to an empty, unfinished or foreign download asset', async () => {
  const broken = release('werkbord-v3.0.0'); broken.assets[0].size = 0;
  const pending = release('werkbord-v2.0.0'); pending.assets[0].state = 'new';
  const foreign = release('werkbord-v1.0.0'); foreign.assets[0].browser_download_url = 'https://example.com/malware.dmg';
  const p = page([broken, [broken, pending, foreign]]);
  p.click(); await settled();
  assert.deepEqual(p.downloads, []);
  assert.match(p.notes[0].textContent, /not available yet/);
  assert.equal(p.notes[1].hidden, false);
});
test('falls back to the direct link on API failure and permits retry', async () => {
  const good = release('werkbord-v1.3.0');
  const p = page([new Error('rate limited'), good]);
  p.click(); await settled();
  assert.equal(p.downloads[0], p.links[0].href);
  p.click(); await settled();
  assert.equal(p.downloads[1], good.assets[0].browser_download_url);
});
test('coalesces repeated clicks and preserves modified clicks', async () => {
  const p = page([release('werkbord-v1.3.0')]);
  for (const extra of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
    assert.equal(p.click(extra), false);
  }
  assert.equal(p.calls.length, 0);
  p.click(); p.click({}, p.links[1]);
  assert.equal(p.links[0]['aria-busy'], 'true');
  await settled();
  assert.equal(p.calls.length, 1);
  assert.equal(p.downloads.length, 1);
});

test('uses only the named unsigned preview when no stable installer exists', async () => {
  const good = { ...release('werkbord-v1.3.1-preview.1', 'Werkbord-preview.dmg'), prerelease: true };
  const p = page([{ tag_name: 'werkbord-v1.3.0', assets: [] }, [
    { ...release('werkbord-v9.0.0-preview.1', 'Werkbord-preview.dmg'), prerelease: true }, good
  ]]);
  p.click(); await settled();
  assert.deepEqual(p.downloads, [good.assets[0].browser_download_url]);
  assert.match(p.notes[0].textContent, /unsigned preview/);
});
test('prefers a stable Mac installer over the preview', async () => {
  const good = release('werkbord-v1.3.2');
  const p = page([{ tag_name: 'werkbord-v1.4.0', assets: [] }, [
    { ...release('werkbord-v1.3.1-preview.1', 'Werkbord-preview.dmg'), prerelease: true }, good
  ]]);
  p.click(); await settled();
  assert.deepEqual(p.downloads, [good.assets[0].browser_download_url]);
});
