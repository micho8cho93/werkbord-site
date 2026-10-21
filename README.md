# werkbord site

The launch page for [werkbord](https://github.com/micho8cho93/werkbord): a headline, a beta waitlist, and a working demo of the app. Plain HTML, CSS and JavaScript. No build step and no dependencies, so it runs as-is on GitHub Pages.

- `index.html`: the page. The headline and subheader, the waitlist, and the demo. From 1200px in landscape the page fits one screen with no scroll: the copy on the left, and on the right a Desktop and Phone switch that shows one simulator at a time, the desktop window or the phone in an iPhone frame. The headline and the simulator scale with the screen. From 768px to 1199px, and in portrait, the same parts stack and the page scrolls. Below 768px the waitlist comes first, and Try the demo opens the phone app full screen with a Back control.
- `404.html`: sends visitors home.
- `assets/css`: `site.css` (tokens from the identity sheet, buttons, header, footer), `app.css` (the app replica), `pages.css` (the page layout, the headline, and the iPhone frame), `waitlist.css` (the waitlist block).
- `assets/js`: `common.js` (helpers shared by the demo), `demo-guide.js` (draws the guided demo's note, its ring and its line, and keeps them in place), `app-demo.js` (the app replica: the desktop window with Universal, Individual and a Team, and the phone with its Control Deck; they share one controller, and Salie offers only predefined messages with scripted replies), `demo-view.js` (the Desktop and Phone switch, the quick actions, and the full-screen phone below 768px), `rolodex.js` (the rotating word in the headline), `waitlist.js` (the email waitlist).
- `assets/img`: the mark in light and dark, the favicon, `og.png` (the 1200 by 630 share image), and `app/overview-light.webp` (the picture shown to visitors without JavaScript).
- `docs/waitlist-schema.sql`: the waitlist database schema and its functions.
- `llms.txt`, `robots.txt`, `sitemap.xml`: a plain-text summary for AI assistants, the crawler rules, and the list of public pages (the home page only).
- `scripts/test-seo.cjs`: the checks for the page.
- `PRODUCT.md`, `DESIGN.md`: the positioning and the design rules the copy and the visuals follow.

The demo is a replica of the Mac app's interface driven by simulated agents. It runs in the page and does not start any agent. The window has the app's workspace switcher: Universal (My Work, Workspaces and Calendar across workspaces, with the Calendar's Timeline), Individual (this computer, with three projects) and a made-up Team called Northwind, labelled early access. Everything in the sidebar opens. my-app is the project the walkthrough drives: it starts with only its finished history, and Salie builds the rest. api-server and marketing-site are full of work of their own (boards, calendars, Git, runs, their own Archive) and are read only: what would change them, such as Start or Merge, says so in a note. api-server's waiting question is live. Each Individual project has Overview, Board, Calendar, Git, Runs and its own settings page; the board's Agent and Priority filters work, and Archive Done tasks, the Archive and Restore work in my-app. Analytics has the app's four views (Activity, Execution, Usage, Completion) and filters over ninety days of example history per project, with today's real work from the board added on top; the Team has its own Analytics. Adding anything is turned off, except through the walkthrough: New task, Add project, Add a phone, Add a Team and the like say so. Comments on a Team ticket still work. Salie has no text box: visitors pick from predefined messages, and each one gets a reply written in advance. A reply can carry generated interface (OpenUI blocks: figures, a chart, a table that sorts and filters) and proposed changes, which wait for a confirmation, one by one or with Confirm all. Salie can also suggest what to do next: at most two suggestions, each with Why this, Useful, Not useful and Dismiss, and a collapsed Memory sources list that cites the scripted records under Settings, Individual memory. A suggestion only opens a place; it starts nothing. The names follow the app: the sidebar lists My Work, Workspaces and Calendar in Universal, a workspace's own home is Workspace, its board column is In progress, and the bottom of the sidebar has Settings and Devices & Hosting. Settings is one screen for Universal, Individual and a Team, and every section is filled in with an example setup: Appearance (the theme), Alerts, Task defaults, Routing rules, Time format, Runners, Agents, This computer, Phones (one is paired), GitHub (a sample account is connected), MCP services (none yet), and Individual and Team memory, where one record can be proposed to the Team and approved by its exact text; the Team has Labels, Devices, Workspace Hosts, Connectivity, MCP clients, Backups and License. Devices & Hosting is a page of its own, listing this computer and the Team it hosts. Help is a button in the window's bottom right corner (and on the phone's deck) that opens the app's own guides, with search. The theme switch is in the rail.

An invitation over the demo invites visitors to start the walkthrough or explore independently. It says what werkbord is in two short paragraphs: a meta-harness, a layer between you and all of your agents, where each agent is a harness around a model and werkbord coordinates them in one workspace (tasks, Git branches and memory together, each agent in its own worktree, nothing merges until the person says so); then Salie and the walkthrough. Only the demo controls are disabled while it is open; the waitlist stays usable. Dismissing it leaves the demo usable with no tutorial highlights; Start walkthrough in the demo bar starts it later. The choice is remembered for the browser tab. The guided story is a set of quiet notes, not a lock. Each note is one step: it names where the visitor has to be, what to press and how to tell it is done (the `STORY` list in `app-demo.js`). The note shows the first step that is not done, so clicking around never breaks it, and when the visitor is elsewhere it points at the next control on the way. The order is planning with Universal and Salie, then running two agents in Individual. While they work, schedule the third task and handle the Team board (the board has four columns, Available, In Progress, Review and Done, with no Backlog; claim a ticket, which goes straight to In Progress and waits there until Start agent; read the comment that mentions you; sign off a review). A ticket opens in the app's layout: description, requirements, the agent (a teammate sees only whether it is active), comments, and a side column with status, dates and Git. Return to the agent's question, inspect Git while it tests, then review and merge and return to Universal. The chapters are Plan, Run, and Review, and the story ends with a skippable look at Settings. The chapters in the bar can be skipped; a skipped part makes what it would have made. Desktop and phone share the core story and the Salie conversation, including a reply that is still streaming. A switch carries the place over: the project, section, task, open sheet and Salie. A round trip with no move on the other surface returns to exactly where the visitor was, even to a place the other surface has no match for, and a workspace switcher left open on the desktop is open again. On the phone a step accepts the equivalent place, such as my-app's own board or Git tab, instead of sending the visitor back to the deck. The phone offers Individual and Team under Projects, with a compact Team board and reviews. The core story ends with Restart and Phone demo (on the phone, See what's special on the phone). That second lesson covers only what is different on the phone. It opens on eight navigation keys and an empty ninth, whose library lists the product's six workflow buttons; only Find Bugs works in the demo. The added key wears the accent and a bug icon. A tap asks for a repository and runs; a hold (or Shift+F10) opens its settings, where a saved repository makes the next tap run straight away. While the paired computer scans, the lesson visits Team under Projects, then opens the report, which the desktop window shows too. Hide a note with its cross, and bring it back with Show tip. A note takes the place that covers the least of the app: it reads the text and controls on show, scores the places around its target by what it would cover and how far it is, never covers a ring, and keeps still until the step changes or something gets in its way. A visitor can drag a note out of the way.

Each ring is drawn in the overlay's own coordinates from the visible part of its target, with the target's corner radius, and stops where the phone's tab bar floats over the page. The guide scrolls a target into view, sideways too, and brings it back when the layout pushes it out (the note docked above a phone grows, say), but not when the visitor scrolled it away.

Rich Salie replies take about 22 seconds: text streams first, then individual metrics, chart bars, table rows or proposed changes arrive in sequence. Proposals become confirmable when generation finishes. Agent phases take 29–33 seconds, with another 26–30 seconds after answering a question. Find Bugs reports four stages over 32 seconds. The agents and Find Bugs run at 75% of the original durations (`PACE` in `app-demo.js`), and Salie's replies at 64% (`ASK_PACE`, 15% quicker again). The calendar shows seven days from the visitor's own today, so tomorrow is always on screen. A pop-up note stays up for 2.6 seconds plus 32 ms per character, up to 9 seconds. Desktop and phone use the same task clock and state; changing views does not restart a run. Agent and workflow progress pauses when the demo is offscreen or the page is hidden. Reduced motion keeps the same durations and uses larger text chunks. Restart cancels pending Salie work and resets both simulators.

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
