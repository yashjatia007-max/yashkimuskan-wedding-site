# yashkimuskan.com — v2 site source

This branch holds the actual source that generates the deployed HTML on `main`
(the `main` branch only contains built output — `index.html`, `v1/`, `v2/`,
`CNAME` — this branch is the editable source behind `index.html` / `v2/index.html`).

## Build

```
python3 build.py
```

Produces `dist/index.html` (canonical, indexable — deploy this as the repo
root `index.html` on `main`) and `dist/v2/index.html` (identical content,
kept `noindex` — deploy as `v2/index.html` on `main`).

## Files

- `gen3.py` — generates HTML fragments (day/event schedule, End Credits list,
  vow text, decorative SVGs) from small Python data structures. **Edit content
  here** — e.g. `CREDITS` (End Credits order/wording), `DAYS` (day-by-day
  schedule), `FR_NAMES` (the four vow promises).
- `body3.html` — page markup skeleton with `{{PLACEHOLDER}}` tokens filled in
  by `build.py` from `gen3.py`'s output.
- `style3.css` — all CSS (also has a few `{{DUST}}` / `{{GRAIN}}` /
  `{{SCALLOP}}` generated-texture placeholders filled by `build.py`).
- `app3.js` — all JS (curtain/clapperboard interaction, scroll-linked
  animation, countdown, phase logic, act navigator, uploader, etc).
- `assets/couple_webp.datauri`, `assets/dance_webp.datauri` — the two hero
  illustrations, pre-encoded as base64 data URIs and inlined directly into
  the built HTML (no separate image requests).
- `build.py` — assembles the above into `dist/index.html` and
  `dist/v2/index.html`.

## v1 (traditional design, has RSVP)

Not reproducible from this branch — no generator for it exists anymore, only
the already-built HTML, preserved as-is at `v1/index.html` on the `main`
branch. Treat it as a frozen backup; if it ever needs real edits, it'll need
to be edited directly as static HTML.

## Deploying a change

1. Edit the relevant source file(s) here (usually `gen3.py` for content).
2. `python3 build.py`.
3. Copy `dist/index.html` → `main` branch's `index.html`, and
   `dist/v2/index.html` → `main` branch's `v2/index.html`. Leave `v1/` and
   `CNAME` untouched.
4. Commit + push `main`. GitHub Pages redeploys automatically within ~1
   minute — no separate deploy step.

See the "Wedding plan" Claude Project doc (`claude/wedding-site-status.md`)
for the full deploy history, DNS setup, and why things are structured this
way.
