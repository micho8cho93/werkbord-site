# Werkbord site

The landing site for [Werkbord](https://github.com/micho8cho93/werkbord): a home page for individual Werkbord and a page for Werkbord Team. Plain HTML, CSS and JavaScript. No build step, no dependencies, so it runs as-is on GitHub Pages.

- `index.html`: individual Werkbord. Hero with the install command, then a working replica of the app (Board, Calendar, Overview and a phone that share one state).
- `team.html`: Werkbord Team. Hero with the Team install command, then a working replica of the Team console (act as Ada, Bo or Cy; claim, submit, review, record merges) and the rules behind it.
- `assets/css`: tokens from the identity sheet (`site.css`), the app replica (`app.css`), page layout (`pages.css`, `team.css`).
- `assets/js`: `common.js` (theme, copy buttons, the pixel field), `app-demo.js`, `team-demo.js`.
- `assets/img`: the mark (light and dark ramps) and the favicon, drawn from the identity sheet's pixel geometry.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Publish

GitHub Pages serves the `main` branch from the repository root (Settings → Pages → Deploy from a branch). All links are relative, so it works under `/werkbord-site/` without changes.

## Keeping it true

The demos replay rules from the product's docs ([TEAM.md](https://github.com/micho8cho93/werkbord/blob/main/docs/TEAM.md), [INSTALL.md](https://github.com/micho8cho93/werkbord/blob/main/docs/INSTALL.md)). The install commands are the ones in the product README and `scripts/`. If the installers move, update the `curl` lines in `index.html` and `team.html`.
