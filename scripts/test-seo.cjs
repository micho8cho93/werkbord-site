// Guards the launch page: search basics, structured data, links, and the copy rules. Run: node --test scripts/test-seo.cjs
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(root, f));
const text = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const meta = (h, attr, name) => {
  const m = h.match(new RegExp('<meta[^>]*' + attr + '="' + name + '"[^>]*content="([^"]*)"'));
  return m ? m[1] : null;
};
const SITE = 'https://micho8cho93.github.io/werkbord-site/';
const COPY = ['index.html', '404.html', 'llms.txt', 'assets/js/waitlist.js', 'assets/js/demo-view.js'];

test('the page has one H1 that names the category, and its rotating word is team, agent or project', () => {
  const h = read('index.html');
  const h1s = h.match(/<h1[\s>][\s\S]*?<\/h1>/g) || [];
  assert.strictEqual(h1s.length, 1);
  const t = text(h1s[0]);
  assert.strictEqual(t, 'A local-first team workspace');
  assert.deepStrictEqual(h.match(/data-words="([^"]+)"/)[1].split(' '), ['team', 'agent', 'project']);
  assert.ok(h.includes('assets/js/rolodex.js'), 'the rotating word needs rolodex.js');
});

test('headline, title and description make no roadmap or unverifiable claim', () => {
  const h = read('index.html');
  const h1 = text(h.match(/<h1[\s>][\s\S]*?<\/h1>/)[0]);
  const title = text(h.match(/<title>([\s\S]*?)<\/title>/)[1]);
  const head = [h1, title, meta(h, 'name', 'description'), meta(h, 'property', 'og:title'), meta(h, 'property', 'og:description')].join(' | ');
  for (const bad of [/any (llm|model|agent)/i, /open[- ]source/i, /\bfree\b/i, /recurring/i, /push notification/i, /soc ?2/i, /enterprise/i, /Claude Code|Codex/, /founding/i]) {
    assert.ok(!bad.test(head), 'unverifiable or tool-bound wording in the headline, title or description: ' + bad + ' in ' + head);
  }
});

test('title and description fit a search result', () => {
  const h = read('index.html');
  const title = text(h.match(/<title>([\s\S]*?)<\/title>/)[1]);
  assert.ok(title.length <= 60, 'title is ' + title.length + ' characters');
  assert.ok(title.includes('Team Workspace') && title.includes('AI Agents'), title);
  const d = meta(h, 'name', 'description');
  assert.ok(d.length >= 120 && d.length <= 160, 'description is ' + d.length + ' characters');
});

test('headings never skip a level', () => {
  const main = read('index.html').match(/<main[\s\S]*?<\/main>/)[0];
  let prev = 1;
  for (const m of main.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1]);
    assert.ok(level <= prev + 1, 'h' + level + ' follows h' + prev);
    prev = level;
  }
});

test('images have alt text, and in-page links resolve', () => {
  const h = read('index.html');
  for (const m of h.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /\balt="/, 'missing alt: ' + m[0].slice(0, 80));
  const ids = new Set([...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of h.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(m[1]), 'no element with id ' + m[1]);
});

test('the page has a canonical link, a share image and a card, and the share image is 1200 by 630', () => {
  const h = read('index.html');
  const canonical = h.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(canonical, 'needs a canonical link');
  assert.strictEqual(canonical[1], SITE);
  assert.strictEqual(meta(h, 'property', 'og:url'), SITE);
  assert.strictEqual(meta(h, 'name', 'twitter:card'), 'summary_large_image');
  const img = meta(h, 'property', 'og:image');
  assert.ok(img && img.startsWith(SITE), 'og:image');
  const local = img.slice(SITE.length);
  assert.ok(exists(local), local + ' is missing');
  const png = fs.readFileSync(path.join(root, local));
  assert.strictEqual(png.readUInt32BE(16), 1200, local + ' width');
  assert.strictEqual(png.readUInt32BE(20), 630, local + ' height');
});

test('structured data parses, describes the page and its organization, and marks up nothing that is not visible', () => {
  const h = read('index.html');
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  assert.strictEqual(blocks.length, 1);
  const graph = blocks.flatMap((b) => b['@graph'] || [b]);
  const types = graph.map((n) => n['@type']);
  for (const t of ['Organization', 'WebSite', 'WebPage']) assert.ok(types.includes(t), 'missing ' + t);
  assert.ok(!types.includes('FAQPage'), 'the page has no visible FAQ to mark up');
  const ids = graph.map((n) => n['@id']).filter(Boolean);
  assert.strictEqual(new Set(ids).size, ids.length, 'duplicate @id');
  const page = graph.find((n) => n['@type'] === 'WebPage');
  assert.strictEqual(page.description, meta(h, 'name', 'description'), 'WebPage description matches the meta description');
  assert.ok(!graph.some((n) => 'aggregateRating' in n || 'review' in n), 'there are no reviews to mark up');
});

test('the sitemap lists the home page only, and the public pages are exactly those in the sitemap', () => {
  const xml = read('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html') && f !== '404.html');
  const expected = pages.map((f) => SITE + (f === 'index.html' ? '' : f));
  assert.deepStrictEqual([...locs].sort(), [...expected].sort());
  assert.deepStrictEqual(locs, [SITE]);
  assert.ok(read('robots.txt').includes('Sitemap: ' + SITE + 'sitemap.xml'));
});

test('llms.txt describes the launch page and only links to pages that exist', () => {
  const t = read('llms.txt');
  assert.ok(t.startsWith('# Werkbord'));
  for (const m of t.matchAll(/\]\((https:\/\/micho8cho93\.github\.io\/werkbord-site\/[^)]*)\)/g)) {
    const rel = m[1].slice(SITE.length) || 'index.html';
    assert.ok(exists(rel), 'llms.txt links to a missing page: ' + m[1]);
  }
});

test('every local link, script, stylesheet and image resolves to a file', () => {
  for (const file of ['index.html', '404.html']) {
    const h = read(file);
    for (const m of h.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const ref = m[1];
      if (/^(https?:|mailto:|data:|#)/.test(ref)) continue;
      const rel = ref.startsWith('/werkbord-site/') ? ref.slice('/werkbord-site/'.length) || 'index.html' : ref;
      assert.ok(exists(rel.split(/[?#]/)[0] || 'index.html'), file + ' links to a missing file: ' + ref);
    }
  }
});

test('the page links to no removed page', () => {
  const h = read('index.html');
  assert.doesNotMatch(h, /team\.html|productivity\.html|docs\/|download\.js/);
  assert.doesNotMatch(read('404.html'), /team\.html|productivity\.html|docs\//);
});

test('the footer holds a copyright line and no navigation or logo', () => {
  const footer = read('index.html').match(/<footer[\s\S]*?<\/footer>/)[0];
  assert.doesNotMatch(footer, /<a\b|<img\b/);
  assert.match(footer, /©\s*\d{4} Werkbord/);
});

test('the waitlist asks for an email and an optional team size of 2 to 6+, and uses the three database functions', () => {
  const js = read('assets/js/waitlist.js');
  for (const fn of ['join_waitlist', 'waitlist_counter', 'waitlist_status']) assert.ok(js.includes(fn), 'missing ' + fn);
  assert.match(js, /name="team_size"/);
  for (const size of ['2', '3', '4', '5', '6+']) assert.ok(js.includes('<option value="' + size + '">'), 'missing team size ' + size);
  assert.doesNotMatch(js, /name="(use|agent|colleagues|consent)"/);
  assert.doesNotMatch(js, /textarea/);
  assert.strictEqual((js.match(/type="email"/g) || []).length, 1);
});

test('the demo has its two mounts, and the scripts load in dependency order', () => {
  const h = read('index.html');
  assert.ok(h.includes('id="app-demo"') && h.includes('id="phone-demo"'));
  const order = ['assets/js/common.js', 'assets/js/app-demo.js', 'assets/js/waitlist.js', 'assets/js/demo-view.js']
    .map((s) => h.indexOf('src="' + s + '"'));
  for (const i of order) assert.ok(i > -1, 'script missing from index.html');
  assert.deepStrictEqual([...order].sort((a, b) => a - b), order);
});

test('house rule: no em dashes in public copy', () => {
  for (const f of COPY) assert.ok(!read(f).includes('—'), f + ' contains an em dash');
});

test('house rule: the copy claims nothing that is not shipped or confirmed', () => {
  for (const f of COPY) {
    const t = read(f);
    for (const bad of [/open[- ]source/i, /\bfree\b/i, /push notification/i, /soc ?2/i, /enterprise/i, /Download for Mac/i, /Founding/]) {
      assert.ok(!bad.test(t), f + ' contains ' + bad);
    }
  }
});
