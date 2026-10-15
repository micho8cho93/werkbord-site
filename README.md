# Werkbord site

The launch page for [Werkbord](https://github.com/micho8cho93/werkbord): a headline, a beta waitlist, and a working demo of the app. Plain HTML, CSS and JavaScript. No build step and no dependencies, so it runs as-is on GitHub Pages.

- `index.html`: the page. The headline and subheader, the waitlist, and the demo. From 1200px in landscape the page fits one screen with no scroll: the copy on the left, and on the right a Desktop and Phone switch that shows one simulator at a time, the desktop window or the phone in an iPhone frame. The headline and the simulator scale with the screen. From 768px to 1199px, and in portrait, the same parts stack and the page scrolls. Below 768px the waitlist comes first, and Try the demo opens the phone app full screen with a Back control.
- `404.html`: sends visitors home.
- `assets/css`: `site.css` (tokens from the identity sheet, buttons, header, footer), `app.css` (the app replica), `pages.css` (the page layout, the headline, and the iPhone frame), `waitlist.css` (the waitlist block).
- `assets/js`: `common.js` (helpers shared by the demo), `demo-guide.js` (draws the guided demo's note, its ring and its line, and keeps them in place), `app-demo.js` (the app replica: the desktop window with Universal, Individual and a Team, and the phone with its Control Deck; they share one controller, and the assistant offers only predefined messages with scripted replies), `demo-view.js` (the Desktop and Phone switch, the quick actions, and the full-screen phone below 768px), `rolodex.js` (the rotating word in the headline), `waitlist.js` (the email waitlist).
- `assets/img`: the mark in light and dark, the favicon, `og.png` (the 1200 by 630 share image), and `app/overview-light.webp` (the picture shown to visitors without JavaScript).
- `docs/waitlist-schema.sql`: the waitlist database schema and its functions.
- `llms.txt`, `robots.txt`, `sitemap.xml`: a plain-text summary for AI assistants, the crawler rules, and the list of public pages (the home page only).
- `scripts/test-seo.cjs`: the checks for the page.
- `PRODUCT.md`, `DESIGN.md`: the positioning and the design rules the copy and the visuals follow.

The demo is a replica of the Mac app's interface driven by simulated agents. It runs in the page and does not start any agent. The window has the app's workspace switcher: Universal (My Work, Calendar and Needs you across workspaces), Individual (this computer, with the my-app project) and a made-up Team called Northwind, labelled early access. Its assistant has no text box: visitors pick from predefined messages, and each one gets a reply written in advance. A reply can carry generated interface (OpenUI blocks: figures, a chart, a table that sorts and filters) and proposed changes, which wait for a confirmation, one by one or with Confirm all. The theme switch is in the demo's rail.

The guided story is a set of quiet notes, not a lock. Each note is one step: it names where the visitor has to be, what to press and how to tell it is done (the `STORY` list in `app-demo.js`). The note shows the first step that is not done, so clicking around never breaks it, and when the visitor is elsewhere it points at the next control on the way. The order is Universal and the assistant, then Individual (two agents in parallel, one question, a scheduled run, review and merge), then the Team (claim a ticket, see teammates' work, sign off a review), then back to Universal. The chapters in the bar can be skipped; a skipped part makes what it would have made. The phone is Individual only, as in the product, and has its own shorter story that mirrors the app's phone layout: it opens on the Control Deck (nine keys, one line on what needs you, what the agents are doing) with a bottom bar of two places, the deck and the Assistant, and Back on every page. The story goes deck, assistant, Projects, two agents, the agent's question under Needs you, Reviews, merge. Hide a note with its cross, and bring it back with Show tip.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Check it

```bash
node --test scripts/test-seo.cjs
```

The tests cover the headline, title and description, the structured data, the sitemap, `llms.txt`, local links, and house rules (no em dashes, no unverified claims).

## Publish

GitHub Pages serves the `main` branch from the repository root (Settings → Pages → Deploy from a branch). Links are relative, except the canonical URLs, the share tags, `sitemap.xml`, `robots.txt` and the 404 page, which use the project path `https://micho8cho93.github.io/werkbord-site/`. If the site moves to its own domain, replace that path everywhere (`grep -rl micho8cho93.github.io/werkbord-site`), update `sitemap.xml`, and submit it to search engines.

## The waitlist

The form talks to a separate Supabase project, `werkbord-waitlist`, through three database functions (`POST /rest/v1/rpc/<name>` with the `apikey` header only):

- `join_waitlist` signs up an email. Joining again with the same email returns the same position.
- `waitlist_status` returns a returning browser's position. The browser remembers its code in `localStorage` (`wb-wl-code`).
- `waitlist_counter` returns the number of the first 50 places taken.

The page collects an email and, optionally, the team size (2, 3, 4, 5 or 6+). The team size is stored in the existing `team_size` column as `team of 2` to `team of 6+`; a blank answer is stored as null. A visit with `?ref=<8 hex>` stores the invite code in `localStorage` (`wb-wl-ref`) and sends it with the signup, but the page does not show invite links.

- The key in `assets/js/waitlist.js` is a **publishable** key and is meant to be public. Never put the `service_role` or a secret key in this repo.
- The table is not readable from the browser: row level security is on with no policies, and `anon` has no table privileges.
- Read the list as the owner, in the Supabase SQL editor: `select email, created_at from public.waitlist_signups order by created_at;`

## Keeping the copy true

- State only what ships today. Planned work appears once, labelled as planned, and never in the headline, title or description.
- No em dashes in public copy.
- Do not call the beta free unless the owner confirms it.
- `assets/img/og.png` is the share image. This repo does not regenerate it, so update it by hand when the headline changes.
