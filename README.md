# Liam Hellman — Un parcours montréalais

French-first bilingual portfolio built as an interactive isometric Montréal. Six stops connect Liam's HR-focused CV, while Pepper walks between them. The city is drawn as separate SVG objects, not a background picture.

## Run

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open the page served on port 4173. No install or build is required. The page also uses classic local scripts and assets so it can be opened directly; direct-file navigation cannot be tested in the managed browser because of its file-access policy.

## Explore

Click a landmark building or numbered entrance. Use the itinerary or Next / Previous in the story panel to visit the six CV stops. Details expand inside the panel; its close and navigation controls remain visible. Escape closes it. The header switches French and English.

Drag the map, pinch or use +/- to zoom. Focus the map and use arrow keys to pan. Recenter restores the overview. Marker typography stays at a readable screen size, with names shown on hover/focus and in the itinerary.

## The scene

`scene.js` uses one isometric projection for terrain, footprints, architecture and characters. Mount Royal uses elevated contours; UdeM, Notre-Dame, the stadium, downtown, triplexes and the Old Port are individual geometry.

- Pepper follows a connected sidewalk graph, including the mountain stairs. Changing destination during a walk reroutes along the current edge.
- Traffic follows explicit street lanes. Pedestrians follow sidewalk circuits.
- Objects and moving actors share a depth-sorted scene layer.
- The Ferris wheel rotates on its support, the basketball bounces within its court, the fountain water stays in its basin, and café smoke rises from its chimney.
- Pause freezes simulation time and all actors, without moving Pepper. Reduced-motion selection places Pepper at the destination without walking.

Geography is approximate. Landmarks act as narrative anchors; a CV stop does not claim the landmark is an employer address.

## Validate

With the server running:

```sh
node --check scene.js
node --check app.js
node tests/portfolio.mjs
```

The smoke test needs development-environment Playwright and Chromium (`CHROMIUM_PATH` overrides `/usr/bin/chromium`). It checks the separate scene geometry, reachable destinations, walking and vehicle clearances against building footprints, actual animation changes, Pepper walking without teleporting, clickable buildings, both languages, tour, pan/zoom, full pause, reduced motion and mobile panels. Visual review is also required; these checks do not establish that the artwork matches a viewer's aesthetic expectations.

## Edit

- `scene.js`: original city artwork, shared world coordinates, navigation and animation.
- `app.js`: bilingual CV facts, panels, tour, camera and controls.
- `style.css`: responsive page layout, screen-sized map markers and story panels.
- `index.html`: document structure and SVG scene host.
- `ASSET_CREDITS.md`: artwork provenance.

No backend, APIs, analytics, music, remote fonts, or runtime packages. No downloadable PDF links, phone numbers or street addresses are shown.
