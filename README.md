# Liam Hellman — Un parcours montréalais

French-first, bilingual personal portfolio: an autumn isometric pixel Montréal with six CV stops, a visitor-controlled tour, and Pepper the black cat. CV facts come from the three supplied résumés; landmarks are narrative anchors rather than exact employer locations. No downloadable résumé, phone number, or street address is displayed.

## Run

From this checkout:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

No installation or build is needed. HTML, CSS, JavaScript and a local Canvas renderer; no remote assets, APIs, or music. GitHub Pages can serve the root directly.

## Use

Choose a labelled stop or follow Pepper. Expand details within each story; Next and Previous advance the tour. Escape closes the dialog. Change French/English at the top. Drag to pan, pinch or use +/- to zoom, and use Recenter to restore the overview. Focus the map and use arrow keys to pan. Pause controls traffic and Pepper's movement; reduced-motion preferences are respected.

## Validate

```sh
node --check app.js
node tests/portfolio.mjs
```

The browser smoke test needs Playwright available in the development environment and Chromium. It does not add runtime dependencies. Set `CHROMIUM_PATH` if Chromium is not at `/usr/bin/chromium`. Start the server first. The test checks the bilingual tour, all six stops, expandable content, no PDF links, zoom/reset, mobile overflow and browser errors. The old illustration-specific tests were replaced because the previous SVG scene was rebuilt with Canvas.

## Edit

- `app.js`: bilingual CV content, pixel drawing, tour, map interaction.
- `style.css`: responsive frame, controls, story panels and Pepper sprite.
- `index.html`: accessible document structure.

Map geography is deliberately approximate. Artwork is procedurally drawn in a consistent pixel grid, inspired by the supplied reference; it is not a reproduction. PDF files retained in `assets/` are not linked by the interface.
