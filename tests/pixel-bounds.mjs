import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

const inside = (item, bounds) => (
  item.x >= bounds.left
  && item.y >= bounds.top
  && item.x + item.width <= bounds.right
  && item.y + item.height <= bounds.bottom
);

const rectsFrom = markup => [...markup.matchAll(/<rect[^>]*x="(-?[\d.]+)"[^>]*y="(-?[\d.]+)"[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/g)].map(match => ({
  x: Number(match[1]),
  y: Number(match[2]),
  width: Number(match[3]),
  height: Number(match[4])
}));
const overlaps = (first, second) => (
  first.left < second.right
  && first.right > second.left
  && first.top < second.bottom
  && first.bottom > second.top
);

const animationLayer = html.indexOf('id="animation-layer"');
const sceneryLayer = html.indexOf('id="scenery"');
const stationLayer = html.indexOf('id="stations"');
const noteLayer = html.indexOf('id="map-notes"');
assert(animationLayer > 0, 'Missing clipped animation layer');
assert(animationLayer < sceneryLayer && sceneryLayer < stationLayer && stationLayer < noteLayer, 'Moving sprites must render below every map text layer');
assert(html.includes('id="animation-layer" clip-path="url(#map-safe-clip)"'), 'Moving sprites must be clipped to the map');
assert(css.includes('#city { overflow: hidden; }'), 'Map motion must not escape the SVG viewport');
assert(/\.label-bg\s*\{[\s\S]*?opacity:\s*1;/.test(css), 'Station text needs an opaque protection panel');

const stopsBlock = app.match(/const stops = \[([\s\S]*?)\n\];/);
assert(stopsBlock, 'Missing station data');
const stationData = [...stopsBlock[1].matchAll(/\{x:(\d+),y:(\d+),en:\{name:'([^']+)'[\s\S]*?\},fr:\{name:'([^']+)'/g)].map(match => ({
  x: Number(match[1]),
  y: Number(match[2]),
  names: [match[3], match[4]]
}));
assert.equal(stationData.length, 6, 'Expected six station labels');
for (const languageIndex of [0, 1]) {
  const labels = stationData.map(station => {
    const width = Math.max(95, station.names[languageIndex].length * 7.4 + 35);
    return {left: station.x + 17, right: station.x + 17 + width, top: station.y - 13, bottom: station.y + 14};
  });
  labels.forEach(label => assert(inside({x: label.left, y: label.top, width: label.right - label.left, height: label.bottom - label.top}, {left: 0, top: 0, right: 1100, bottom: 710}), 'Station label escaped the map'));
  labels.forEach((label, index) => labels.slice(index + 1).forEach(other => assert(!overlaps(label, other), 'Station labels overlap each other')));
}

for (const id of ['pixel-person-a', 'pixel-person-b']) {
  const symbol = html.match(new RegExp(`<symbol id="${id}"[\\s\\S]*?<\\/symbol>`));
  assert(symbol, `Missing ${id} sprite`);
  rectsFrom(symbol[0]).forEach(rect => {
    assert(inside(rect, {left: 0, top: 0, right: 18, bottom: 34}), `${id} escaped its 18×34 sprite`);
  });
}

const trainMarkup = app.match(/car\.innerHTML=`([\s\S]*?)`;/);
assert(trainMarkup, 'Missing pixel train markup');
rectsFrom(trainMarkup[1]).forEach(rect => {
  assert(inside(rect, {left: -14, top: -8, right: 14, bottom: 8}), 'Train detail escaped the original train footprint');
});
assert(trainMarkup[1].includes('d="M-13-6H9v2h4V6H9v1h-22Z"'), 'Train body changed beyond its approved footprint');

const pulseMarkup = app.match(/<g class="station-pixel-pulse"[\s\S]*?<\/g>/);
assert(pulseMarkup, 'Missing contained station animation');
rectsFrom(pulseMarkup[0]).forEach(rect => {
  assert(inside(rect, {left: -10, top: -10, right: 10, bottom: 10}), 'Station animation escaped the stop marker');
});

const walkingPaths = app.match(/const walkingPaths=\[([^\]]+)\]/);
assert(walkingPaths, 'Missing fixed pedestrian paths');
const pathNumbers = [...walkingPaths[1].matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number(match[0]));
for (let index = 0; index < pathNumbers.length; index += 2) {
  assert(pathNumbers[index] >= 0 && pathNumbers[index] <= 1100, 'Walker path escaped map width');
  assert(pathNumbers[index + 1] >= 0 && pathNumbers[index + 1] <= 710, 'Walker path escaped map height');
}

assert(app.includes('const trainFrameDuration=1/12;'), 'Train cadence must remain stepped at 12 FPS');
assert(app.includes('const walkerFrameDuration=1/8;'), 'Walker cadence must remain stepped at 8 FPS');
assert(css.includes('.station.current .station-pixel-pulse'), 'Only the current station may animate');
assert(css.includes('@media(prefers-reduced-motion:reduce)'), 'Reduced-motion support is required');

console.log('Version 1 pixel bounds verified: clipped motion layer, protected text, fixed sprite footprints, and stepped animation cadence.');
