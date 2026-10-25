# Werkbord website

The launch page for Werkbord: **one app with Personal and Team projects**, under **Free and Premium** plans. Plain HTML,
CSS and JavaScript, served as-is on GitHub Pages. This source update is local; publishing is a separate action.

## Product copy

Free includes all Personal work and any number of teams of up to two people, owner included. Teams of three or more need
Premium for every member. Extra devices do not count as people. A member without proof retains read-only access in a larger
team. Premium is a per-person signed key, checked offline by the app and host. It is a one-time purchase, not yet on sale.
Both plans use the same download, with no vendor account, subscription, separate Team product or runtime Team licence.

The product's canonical references are `../werkbord/docs/PLANS.md`, `STRUCTURE.md`, `ARCHITECTURE.md` §22 and
`unified-platform/ACCEPTANCE.md`. Personal / Team are project kinds; Home is the cross-workspace landing page. Existing
lowercase demo state values `individual` and `universal` remain internal identifiers. Public copy uses Personal and Home.

## Files and demo

- `index.html`: headline, waitlist, expandable plan facts and desktop/phone demo. Keep the existing responsive layout,
  pixel mark, Geist typography, light/dark themes and reduced-motion support.
- `llms.txt`: the same product facts as the page, including release limits and pending work.
- `assets/js/app-demo.js`: a scripted simulator over made-up data. The desktop sidebar groups Personal projects and a team,
  with Home, Calendar, Reviews and Analytics once each. Settings → Plan explains Free/Premium; there is no workspace licence
  screen or workspace switcher. The sample team illustrates Premium access; no real unlock key is checked. The phone keeps the Control Deck. Saved demo records use browser memory/storage only.
- `assets/js/demo-guide.js`, `demo-motion.js`: the guided story and motion. Navigation points directly to workspace sections.
  The screens are illustrative and simplified; the demo does not exercise native confirmations, Premium verification,
  installation or project moves against real services. It cannot establish production acceptance.
- `assets/js/waitlist.js`: existing waitlist transport, unchanged by this update. Local UI checks must stub its network calls.
- `scripts/test-seo.cjs`: metadata, links, structured data, naming and plan-copy checks.

The actual product supports Claude Code, Codex, Gemini CLI and OpenCode through the user's installed CLIs and sign-ins.
Team coordinates; agents execute on each member's own runner with their own credentials. Nothing merges without a person.
Salie's proposed Team read-only policy and remaining Home polish are pending in the product; do not claim them complete.

## Verify locally

```sh
node --test scripts/test-seo.cjs
node --check assets/js/app-demo.js
python3 -m http.server 5188 --bind 127.0.0.1
```

Inspect desktop and phone layouts, plan disclosure and demo navigation, including the guided story, keyboard access and
Settings → Plan. Stub the waitlist endpoints for local checks. This stage does not publish the website, submit waitlist data,
change hosted services or approve a release. Production admission remains blocked; Mac preview first, Linux opt-in after
acceptance, Windows publication deferred.
