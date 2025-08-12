# Article Creation — Quick Notes

- Local dev:
  - Run `npm run dev` and open the URL shown (usually `http://localhost:5173`).
  - Pages use the `/article-creation/` base. Open `.../article-creation/article-creation.html` etc.
  - Root HTML files import `./src/...` so styles/scripts work in dev.

- Local prod preview:
  - Run `npm run build && npm run preview` and open `http://localhost:4173/article-creation/`.
  - This serves the built (hashed) assets exactly like GitHub Pages.

- Deploy to GitHub Pages (safe):
  - Work on the `source` branch.
  - Run `npm run deploy` to build and publish only `dist/` to `gh-pages` (via `tools/deploy-gh-pages.sh`).
  - This keeps local dev HTML untouched and avoids breaking localhost styling.

- Notes:
  - Do not manually copy `dist/*.html` into the repo root.
  - GitHub Pages serves from the `gh-pages` branch (the `dist/` output only).
