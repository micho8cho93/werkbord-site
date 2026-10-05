# Werkbord site

The landing site for [Werkbord](https://github.com/micho8cho93/werkbord): a home page for individual Werkbord and a page for Werkbord Team. Plain HTML, CSS and JavaScript. No build step, no dependencies, so it runs as-is on GitHub Pages.

- `index.html`: individual Werkbord. Hero with the install command, then a working replica of the app (Board, Calendar, Overview and a phone that share one state), then the Team waitlist.
- `team.html`: Werkbord Team. A working replica of the Team console (act as Ada, Bo or Cy; claim, submit, review, record merges), the rules behind it, and the Team waitlist. Team has no installer yet; it is waitlist only.
- `assets/css`: tokens from the identity sheet (`site.css`), the app replica (`app.css`), page layout (`pages.css`, `team.css`), the waitlist block (`waitlist.css`).
- `assets/js`: `common.js` (theme, copy buttons, the pixel field), `app-demo.js`, `team-demo.js`, `waitlist.js`.
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
- Position is signup order minus 5 places per referral. The first 50 places are the Founding 50 (free, up to 5 seats each); places 51 to 1,000 get half price on their first 5 seats. Those numbers live in `waitlist.js` (copy) and `docs/waitlist-schema.sql` (position maths).
- Invite links are `<page>/?ref=<8 hex>`. A visit with `?ref=` stores the code in `localStorage` (`wb-wl-ref`) and sends it with the signup. A returning signup is remembered under `wb-wl-code`.
- Read the list as the owner in the Supabase dashboard (Table editor or SQL editor). Nothing on the site can list emails.

## Keeping it true

The demos replay rules from the product's docs ([TEAM.md](https://github.com/micho8cho93/werkbord/blob/main/docs/TEAM.md), [INSTALL.md](https://github.com/micho8cho93/werkbord/blob/main/docs/INSTALL.md)). The install commands are the ones in the product README and `scripts/`. If the installer moves, update the `curl` line in `index.html`. The Team page has no install command while Team is waitlist only; add one back when Team ships.
