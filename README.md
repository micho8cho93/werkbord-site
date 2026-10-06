# Werkbord site

The landing site for [Werkbord](https://github.com/micho8cho93/werkbord): a home page for individual Werkbord and a page for Werkbord Team. Plain HTML, CSS and JavaScript. No build step, no dependencies, so it runs as-is on GitHub Pages.

- `index.html`: individual Werkbord. A short intro, interactive app and phone demos sharing one state, installation, and the Team waitlist.
- `team.html`: Werkbord Team. The interactive Team console immediately below the intro, three core benefits with sourced technical figures, and the Team waitlist. Public access is offered through the waitlist; the docs include installation for people with access.
- `assets/css`: tokens from the identity sheet (`site.css`), the app replica (`app.css`), page layout (`pages.css`, `team.css`), the waitlist block (`waitlist.css`).
- `assets/js`: `intro.js` (finite full-screen pixel entrance), `common.js` (theme and copy buttons), `app-demo.js`, `team-demo.js`, `waitlist.js`.
- `docs/*.html`: native documentation, generated with `python3 scripts/build-docs.py`. Edit the articles in that script, then regenerate. Search uses `docs/search-index.json`.
- `demo.html`: the same individual app inside the phone, with shared tasks and independent navigation.
- `docs/waitlist-schema.sql`: the waitlist database schema and functions.
- `assets/img`: the mark (light and dark ramps) and the favicon, drawn from the identity sheet's pixel geometry.

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

## Keeping it true

The demos replay rules from the product's docs ([Team setup](docs/team-setup.html), [Installation](docs/installation.html)). The install commands are the ones in the product README and `scripts/`. If the installer moves, update the `curl` line in `index.html`. Team installation is documented for users who already have access.

## The Mac app's download button

`Download for Mac` (the hero and the install block, `data-mac-download`) links to `https://github.com/micho8cho93/werkbord/releases/latest/download/Werkbord.dmg`. That address never changes: every individual release uploads its disk image twice, as `Werkbord_<version>_darwin_universal.dmg` and, byte for byte, as `Werkbord.dmg`, and GitHub serves `/releases/latest/download/<file>` from the newest individual release (Team releases are never "latest"). The disk image is signed and notarized, and is one app for Apple Silicon and Intel.

`assets/js/download.js` adds one thing to the plain link: **when someone clicks**, it asks GitHub's API whether the newest release has `Werkbord.dmg`; if so the click goes on to the download, and if not (before the first release that carries the app) the page says so and points at the command line installer. The page itself makes no request to GitHub on load. Without JavaScript the link is followed as it is.

The terminal line next to it (`curl -fL -o Werkbord.dmg …`) is the same address. If the product ever renames the asset, change it in `index.html`, `scripts/build-docs.py` (then run it) and `assets/js/download.js`.

## Page behavior

- The entry animation covers the viewport with the brand grid, reveals the mark and name, then exits in under two seconds. Internal navigation and reduced-motion preferences skip it. Keyboard/pointer input dismisses it, and both CSS and JavaScript provide automatic exits.
- Docs links open the corresponding native documentation pages. Footer links are limited to Team, Install and Docs. Public Team signup uses the waitlist; its Install link points to individual Werkbord.
- Signup needs only an email. Agent, team size and teammate invitations remain available under optional team details. The existing Supabase functions and consent validation are unchanged.
- The referral panel shows the user's real position and link, supports copying, and offers an email reset. Returning users recover their status from the same browser storage.
- The two technical figures on Team are sourced product facts: sub-second board sync **in tests** and 256-bit access tokens ([access and security](docs/team-security.html)).

## Verification

Checked desktop (1440px) and mobile (390px), light/dark themes, reduced motion, entry/exit and internal navigation, demo navigation and shared phone state, install-command copy, and local anchors. Signup validation, optional consent, loading, confirmation, referral copy, returning users, reset, server/network failure, and full-capacity states were exercised with intercepted API responses. The live counter was checked read-only; verification did not create real waitlist entries.
