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
assert(sceneryLayer < animationLayer && animationLayer < stationLayer && stationLayer < noteLayer, 'Moving sprites need foreground visibility while station and map text stay on top');
assert(html.includes('id="animation-layer" clip-path="url(#map-safe-clip)" mask="url(#animation-occlusion-mask)"'), 'Moving sprites must be clipped and use the occlusion mask');
const occlusionMask = html.match(/<mask id="animation-occlusion-mask"[\s\S]*?<\/mask>/);
assert(occlusionMask, 'Missing animation occlusion mask');
const protectedZones = rectsFrom(occlusionMask[0]);
assert(protectedZones.length >= 10, 'Every building sign and map note needs a protected zone');
protectedZones.forEach(zone => assert(inside(zone, {left: 0, top: 0, right: 1100, bottom: 710}), 'Protected zone escaped the map'));
const protectedBounds = protectedZones.map(zone => ({left: zone.x, right: zone.x + zone.width, top: zone.y, bottom: zone.y + zone.height}));
assert((occlusionMask[0].match(/text-safe-zone/g) || []).length >= 10, 'Text-safe mask coverage is incomplete');
assert((occlusionMask[0].match(/scene-occlusion-zone/g) || []).length >= 6, 'Building occlusion coverage is incomplete');
assert(css.includes('#city { overflow: hidden; }'), 'Map motion must not escape the SVG viewport');
assert(/\.label-bg\s*\{[\s\S]*?opacity:\s*1;/.test(css), 'Station text needs an opaque protection panel');
assert(html.includes('class="map-panel night-mode"'), 'The deep-green map treatment must be permanent');
assert(html.includes('<meta name="theme-color" content="#24382f">'), 'Browser theme color must match the deep-green map');
assert(!html.includes('id="theme"'), 'The day/night switch must stay removed');
assert(!html.includes('id="station-list"') && !html.includes('class="station-section"'), 'The redundant station-button section must stay removed');
assert(!app.includes("$('#theme')") && !app.includes("$('#station-list')"), 'Removed controls must not leave runtime references');

const stopsBlock = app.match(/const stops = \[([\s\S]*?)\n\];/);
assert(stopsBlock, 'Missing station data');
const stationData = [...stopsBlock[1].matchAll(/\{x:(\d+),y:(\d+),en:\{name:'([^']+)'[\s\S]*?\},fr:\{name:'([^']+)'/g)].map(match => ({
  x: Number(match[1]),
  y: Number(match[2]),
  names: [match[3], match[4]]
}));
assert.equal(stationData.length, 6, 'Expected six station labels');
for (const languageIndex of [0, 1]) {
  const labels = stationData.map((station, index) => {
    const width = Math.max(95, station.names[languageIndex].length * 7.4 + 35);
    const localX = index === 1 ? -width - 17 : 17;
    return {left: station.x + localX, right: station.x + localX + width, top: station.y - 13, bottom: station.y + 14};
  });
  labels.forEach(label => assert(inside({x: label.left, y: label.top, width: label.right - label.left, height: label.bottom - label.top}, {left: 0, top: 0, right: 1100, bottom: 710}), 'Station label escaped the map'));
  labels.forEach((label, index) => labels.slice(index + 1).forEach(other => assert(!overlaps(label, other), 'Station labels overlap each other')));
  labels.forEach(label => protectedBounds.forEach(zone => assert(!overlaps(label, zone), 'Station label overlaps protected scenery or map text')));
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

console.log('Version 1 pixel bounds verified: coherent layering, protected text and buildings, fixed sprite footprints, and stepped animation cadence.');
