// Renders the 1200 by 630 share images from the templates in this folder.
// It needs playwright-core and a Chrome: NODE_PATH=/folder/with/node_modules node scripts/og/shoot.cjs
// (set CHROME to the browser binary if it is not the macOS default). Edit the headline in the HTML first.
const { chromium } = require('playwright-core');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const jobs = [['home', 'og.png'], ['team', 'og-team.png'], ['productivity', 'og-productivity.png']];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  for (const [page, out] of jobs) {
    const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await p.goto('file://' + path.join(__dirname, page + '.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(root, 'assets', 'img', out) });
    await p.close();
    console.log('wrote assets/img/' + out);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
