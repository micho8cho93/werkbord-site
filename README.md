# Werkbord site

The landing site for [Werkbord](https://github.com/micho8cho93/werkbord): a home page for individual Werkbord and a page for Werkbord Team. Plain HTML, CSS and JavaScript. No build step, no dependencies, so it runs as-is on GitHub Pages.

- `index.html`: the home page, a team workspace for AI agents. A short intro, interactive app and phone demos sharing one state, the Team and Productivity routes, four rules, proof from tests and docs, three install steps, an FAQ, the download, and the Team waitlist.
- `team.html`: Werkbord Team. The interactive Team console immediately below the intro, three core benefits with sourced technical figures, and the Team waitlist. Public access is offered through the waitlist; the docs include installation for people with access.
- `assets/css`: tokens from the identity sheet (`site.css`), the app replica (`app.css`), page layout (`pages.css`, `team.css`), the waitlist block (`waitlist.css`).
- `assets/js`: `intro.js` (finite full-screen pixel entrance), `common.js` (theme and copy buttons), `app-demo.js`, `team-demo.js`, `waitlist.js`.
- `docs/*.html`: native documentation, generated with `python3 scripts/build-docs.py`. Edit the articles in that script, then regenerate. Search uses `docs/search-index.json`.
- `demo.html`: the same individual app inside the phone, with shared tasks and independent navigation.
- `docs/waitlist-schema.sql`: the waitlist database schema and functions.
- `assets/img`: the mark (light and dark ramps) and the favicon, drawn from the identity sheet's pixel geometry.
- `llms.txt`, `robots.txt`, `sitemap.xml`: the plain-text summary for AI assistants, crawler rules, and the list of public pages. `assets/img/og*.png` are the 1200 by 630 share images (home, Team, Productivity), rendered from the templates in `scripts/og/` (edit the headline there, then run `NODE_PATH=<folder with playwright-core> node scripts/og/shoot.cjs`).
- `scripts/test-seo.cjs`: guards the search basics. Run `node --test scripts/test-seo.cjs`.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Publish

GitHub Pages serves the `main` branch from the repository root (Settings → Pages → Deploy from a branch). All links are relative, so it works under `/werkbord-site/` without changes.

## The waitlist

Any element with `data-waitlist` is replaced by the waitlist block (offer, seat counter, form). It is the only thing on the site that collects anything.

- It talks to a separate Supabase project, `werkbord-waitlist`, through three database functions: `join_waitlist`, `waitlist_status`, `waitlist_counter` (`POST /rest/v1/rpc/<name>`, `apikey` header only). The table is not readable from the browser: row level security is on with no policies and `anon` has no table privileges.
- The key in `assets/js/waitlist.js` is a **publishable** key. It is meant to be public. Never put the `service_role` or secret key in this repo.
- Position is signup order minus 5 places per referral. The first 50 places are the Founding 50 (free, up to 5 seats each); places 51 to 1,000 get half price on their first 5 seats. The landing page highlights the Founding 50; pricing tiers and referral scoring are not part of its promotional copy. Position maths remain in `docs/waitlist-schema.sql`.
- Invite links are `<page>/?ref=<8 hex>`. A visit with `?ref=` stores the code in `localStorage` (`wb-wl-ref`) and sends it with the signup. A returning signup is remembered under `wb-wl-code`.
- Read the list as the owner in the Supabase dashboard (Table editor or SQL editor). Nothing on the site can list emails.

## Search and AI visibility

- The home page names the category in its title, H1 and description (a local-first team workspace for AI agents, with no named tool and no roadmap claim; the test enforces both), and carries a canonical link, share tags and JSON-LD (`Organization`, `WebSite`, `SoftwareApplication`, `WebPage`, `FAQPage`). The FAQ in the JSON-LD is the visible FAQ: edit both together, `test-seo.cjs` fails if they differ. There are no reviews or ratings to mark up, so none are.
- `sitemap.xml` is hand-maintained. Add every new public page to it; the test fails if one is missing. Update `llms.txt` when a fact on the site changes, and keep its limits section honest.
- **The site is served from a project path on `github.io`.** Crawlers read `robots.txt` and `llms.txt` only at the root of a host, so those two files take effect once the site has its own domain (Settings → Pages → Custom domain). Then replace `https://micho8cho93.github.io/werkbord-site/` everywhere (`grep -rl` it), run `python3 scripts/build-docs.py`, and submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- When the home page changes in substance, bump `dateModified` in its JSON-LD and the matching `lastmod` in `sitemap.xml`.
- Do not publish a claim the product's own docs do not support: no "open source" while the product repository has no license, no "free" beyond the preview, no recurring schedules or push notifications, nothing implying an independent security audit.

## Keeping it true

The proof rows and FAQ answers on the home page, and `docs/security.html`, come from the product's `docs/PHONE.md`, `INSTALL.md`, `ORCHESTRATION.md`, `audit/` reports and `.github/workflows/ci.yml`. The performance figure is `go test ./internal/runner -run TestPlanQueueScaling -v` in the product repository: re-run it before changing the number. The demos replay rules from the product's docs ([Team setup](docs/team-setup.html), [Installation](docs/installation.html)). The install commands are the ones in the product README and `scripts/`. If the installer moves, update the `curl` line in `index.html`. Team installation is documented for users who already have access.

## The Mac app's download button

`Download for Mac` links directly to the explicitly requested unsigned test preview:
`https://github.com/micho8cho93/werkbord/releases/download/werkbord-v1.3.1-preview.1/Werkbord-preview.dmg`.
The page labels it as an unsigned preview and gives the macOS **Privacy & Security → Open Anyway** first-launch instructions.
It is a universal DMG for Apple Silicon and Intel, with an ad-hoc app signature, no notarization, and no Sparkle app updater.
It is a GitHub prerelease, never the latest stable release, and is never published as `Werkbord.dmg` or an appcast update.

`assets/js/download.js` resolves the actual asset **when someone clicks**. It checks the latest stable release first,
then searches the most recent 100 releases for the highest stable individual version with a universal DMG. If none exists,
it uses only the named preview above. Team, drafts, other prereleases, empty assets and foreign URLs are excluded.
The click uses the asset’s pinned release URL. Repeated clicks share the pending check; API failures and an eight-second
timeout fall back to the ordinary link. No GitHub request is made on page load. Without JavaScript the preview link works directly.

GitHub serves the asset as a file download. Browsers use their configured download folder (normally Downloads);
a website cannot override that preference. The copyable terminal command explicitly saves it in `~/Downloads`.
Run `node --test scripts/test-download.cjs` for the download selection regressions.
The product repository’s `docs/DESKTOP_RELEASE.md` describes both preview builds and the Apple setup for signed releases.

## Page behavior

- The entry animation covers the viewport with the brand grid, reveals the mark and name, then exits in under two seconds. Internal navigation and reduced-motion preferences skip it. Keyboard/pointer input dismisses it, and both CSS and JavaScript provide automatic exits.
- Docs links open the corresponding native documentation pages. Footer links are limited to Team, Install and Docs. Public Team signup uses the waitlist; its Install link points to individual Werkbord.
- Signup needs only an email. Agent, team size and teammate invitations remain available under optional team details. The existing Supabase functions and consent validation are unchanged.
- The referral panel shows the user's real position and link, supports copying, and offers an email reset. Returning users recover their status from the same browser storage.
- The two technical figures on Team are sourced product facts: sub-second board sync **in tests** and 256-bit access tokens ([access and security](docs/team-security.html)).

## Verification

Checked desktop (1440px) and mobile (390px), light/dark themes, reduced motion, entry/exit and internal navigation, demo navigation and shared phone state, install-command copy, and local anchors. Signup validation, optional consent, loading, confirmation, referral copy, returning users, reset, server/network failure, and full-capacity states were exercised with intercepted API responses. The live counter was checked read-only; verification did not create real waitlist entries.
