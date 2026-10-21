# Liam Hellman — Un parcours montréalais

French-first bilingual portfolio with a Montréal autumn pixel-art map, six HR-focused CV stops and Pepper the black cat. CV facts come from Liam's three supplied résumés. Landmarks are narrative anchors rather than employer addresses.

## Run

Open `index.html` directly, or serve the checkout:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

No installation or build is required. All site assets are local. No backend, APIs, music, remote fonts or runtime dependencies.

## Explore

Choose a numbered marker or a stop in the itinerary. Each opens a story drawer with expandable details and Previous / Next controls. The close button and navigation stay visible while content scrolls. Escape closes the drawer. The language button switches French and English.

Drag to pan; pinch or use +/- to zoom. Focus the map and use arrow keys to pan. Recenter restores the initial view. Map markers keep a consistent screen size as the artwork zooms. On phones, markers show their numbers; the itinerary underneath supplies the names.

Animation is intentionally contained: Pepper idles in place, water glints are clipped to the river, and one ferry follows a separate lane entirely inside the lower river. Pepper relocates between destinations without tweening through architecture. Pause and reduced-motion preferences stop animation. The old procedural traffic paths and line across rooftops were removed.

## Validate

With the server running:

```sh
node --check app.js
node tests/portfolio.mjs
```

The smoke test uses development-environment Playwright and Chromium. Set `CHROMIUM_PATH` if Chromium is not at `/usr/bin/chromium`. Tests cover asset decoding, the bilingual six-stop tour, expandable details, label spacing and sizing, keyboard dismissal, zoom/reset, pause, mobile overflow, fixed drawer controls, and attempts direct `file://` use (reported as skipped when managed-browser policy blocks local file navigation). Visual review is still necessary; passing interaction tests alone does not establish art quality or animation coherence.

## Files

- `app.js`: bilingual CV content, story navigation, pan and zoom.
- `style.css`: page layout, map pins, panels and contained animation.
- `index.html`: document structure and local illustration.
- `assets/montreal-autumn.png`: dedicated illustrated city scene.
- `ASSET_CREDITS.md`: artwork provenance.

The PDFs retained in `assets/` are not linked in the interface. No phone number or street address is displayed.
