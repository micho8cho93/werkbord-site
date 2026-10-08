// Guards the search and AI-visibility basics of the public pages. Run: node --test scripts/test-seo.cjs
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
const PAGES = { 'index.html': '', 'team.html': 'team.html', 'productivity.html': 'productivity.html' };

test('the docs generator can still read the shared header and theme script from index.html', () => {
  const h = read('index.html');
  assert.match(h, /<header class="nav">[\s\S]*?<\/header>/);
  const first = h.match(/<script>[\s\S]*?<\/script>/);
  assert.ok(first && first[0].includes('wb-theme'), 'the first bare <script> must be the theme script');
});

test('home page: one H1 that names the category, the audience and the AI agents', () => {
  const h = read('index.html');
  const h1s = h.match(/<h1[\s>][\s\S]*?<\/h1>/g) || [];
  assert.strictEqual(h1s.length, 1);
  const t = text(h1s[0]);
  for (const word of ['workspace', 'team', 'AI agents']) assert.ok(t.includes(word), 'H1 should include ' + word + ': ' + t);
});

test('home page: headline, title and description make no roadmap or unverifiable claim', () => {
  const h = read('index.html');
  const h1 = text(h.match(/<h1[\s>][\s\S]*?<\/h1>/)[0]);
  const title = text(h.match(/<title>([\s\S]*?)<\/title>/)[1]);
  const head = [h1, title, meta(h, 'name', 'description'), meta(h, 'property', 'og:title'), meta(h, 'property', 'og:description')].join(' | ');
  for (const bad of [/any (llm|model|agent)/i, /open[- ]source/i, /\bfree\b/i, /recurring/i, /push notification/i, /soc ?2/i, /enterprise/i, /Claude Code|Codex/]) {
    assert.ok(!bad.test(head), 'unverifiable or tool-bound wording in the headline, title or description: ' + bad + ' in ' + head);
  }
});

test('home page: title and description fit a search result', () => {
  const h = read('index.html');
  const title = text(h.match(/<title>([\s\S]*?)<\/title>/)[1]);
  assert.ok(title.length <= 60, 'title is ' + title.length + ' characters');
  assert.ok(title.includes('Team Workspace') && title.includes('AI Agents'), title);
  const d = meta(h, 'name', 'description');
  assert.ok(d.length >= 120 && d.length <= 160, 'description is ' + d.length + ' characters');
});

test('home page: headings never skip a level', () => {
  const main = read('index.html').match(/<main[\s\S]*?<\/main>/)[0];
  let prev = 1;
  for (const m of main.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1]);
    assert.ok(level <= prev + 1, 'h' + level + ' follows h' + prev);
    prev = level;
  }
});

test('home page: images have alt text and in-page links resolve', () => {
  const h = read('index.html');
  for (const m of h.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /\balt="/, 'missing alt: ' + m[0].slice(0, 80));
  const ids = new Set([...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of h.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(m[1]), 'no element with id ' + m[1]);
});

test('public pages: canonical, share image and card are present and point at real files', () => {
  for (const [file, rel] of Object.entries(PAGES)) {
    const h = read(file);
    const canonical = h.match(/<link rel="canonical" href="([^"]+)"/);
    assert.ok(canonical, file + ' needs a canonical link');
    assert.strictEqual(canonical[1], SITE + rel, file + ' canonical');
    assert.strictEqual(meta(h, 'property', 'og:url'), SITE + rel, file + ' og:url');
    assert.strictEqual(meta(h, 'name', 'twitter:card'), 'summary_large_image');
    const img = meta(h, 'property', 'og:image');
    assert.ok(img && img.startsWith(SITE), file + ' og:image');
    const local = img.slice(SITE.length);
    assert.ok(exists(local), local + ' is missing');
    const png = fs.readFileSync(path.join(root, local));
    assert.strictEqual(png.readUInt32BE(16), 1200, local + ' width');
    assert.strictEqual(png.readUInt32BE(20), 630, local + ' height');
  }
});

test('home page: structured data parses, and the FAQ markup is the visible FAQ', () => {
  const h = read('index.html');
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  assert.ok(blocks.length >= 1);
  const graph = blocks.flatMap((b) => b['@graph'] || [b]);
  const types = graph.map((n) => n['@type']);
  for (const t of ['Organization', 'WebSite', 'SoftwareApplication', 'WebPage', 'FAQPage']) assert.ok(types.includes(t), 'missing ' + t);
  const ids = graph.map((n) => n['@id']).filter(Boolean);
  assert.strictEqual(new Set(ids).size, ids.length, 'duplicate @id');
  const faq = graph.find((n) => n['@type'] === 'FAQPage').mainEntity;
  const visible = [...h.matchAll(/<details><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map((m) => ({
    q: text(m[1]),
    a: text(m[2].replace(/<p class="faq-more">[\s\S]*?<\/p>/, '')),
  }));
  assert.strictEqual(visible.length, faq.length, 'visible FAQ and FAQPage differ in length');
  visible.forEach((v, i) => {
    assert.strictEqual(faq[i].name, v.q, 'question ' + (i + 1));
    assert.strictEqual(faq[i].acceptedAnswer.text, v.a, 'answer ' + (i + 1));
  });
  assert.ok(!graph.some((n) => 'aggregateRating' in n || 'review' in n), 'there are no reviews to mark up');
});

test('home page links into the docs land on real anchors', () => {
  const h = read('index.html');
  const links = [...h.matchAll(/href="(docs\/[a-z-]+\.html)(?:#([^"]+))?"/g)];
  assert.ok(links.length > 0);
  for (const [, file, id] of links) {
    assert.ok(exists(file), file + ' is missing');
    if (id) assert.ok(read(file).includes('id="' + id + '"'), file + ' has no #' + id);
  }
});

test('sitemap lists every public page, and every listed page exists', () => {
  const xml = read('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const files = [];
  for (const f of ['index.html', 'team.html', 'productivity.html']) files.push(f);
  for (const f of fs.readdirSync(path.join(root, 'docs'))) if (f.endsWith('.html')) files.push('docs/' + f);
  const expected = files.map((f) => SITE + (f === 'index.html' ? '' : f));
  assert.deepStrictEqual([...locs].sort(), [...expected].sort());
  const robots = read('robots.txt');
  assert.ok(robots.includes('Sitemap: ' + SITE + 'sitemap.xml'));
});

test('llms.txt describes the product and only links to pages that exist', () => {
  const t = read('llms.txt');
  assert.ok(t.startsWith('# Werkbord'));
  for (const m of t.matchAll(/\]\((https:\/\/micho8cho93\.github\.io\/werkbord-site\/[^)]*)\)/g)) {
    const rel = m[1].slice(SITE.length) || 'index.html';
    assert.ok(exists(rel), 'llms.txt links to a missing page: ' + m[1]);
  }
});

test('house rule: no em dashes in public copy', () => {
  for (const f of ['index.html', 'team.html', 'productivity.html', 'llms.txt']) assert.ok(!read(f).includes('—'), f + ' contains an em dash');
  for (const f of fs.readdirSync(path.join(root, 'docs'))) if (f.endsWith('.html')) assert.ok(!read('docs/' + f).includes('—'), f + ' contains an em dash');
});
