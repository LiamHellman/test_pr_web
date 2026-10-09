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

const landmarkBounds = {
  udem: {left: 8, top: 9, right: 107, bottom: 74},
  rosemont: {left: 8, top: 20, right: 104, bottom: 78},
  berri: {left: 9, top: 2, right: 91, bottom: 73},
  pda: {left: 6, top: 28, right: 111, bottom: 77},
  square: {left: 18, top: 6, right: 94, bottom: 65},
  drapeau: {left: 18, top: 6, right: 96, bottom: 84}
};

let landmarkPixelCount = 0;
for (const [id, bounds] of Object.entries(landmarkBounds)) {
  const template = app.match(new RegExp(id + ': `([\\s\\S]*?)`[,\\n]'));
  assert(template, `Missing ${id} landmark template`);
  const pixelGroup = template[1].match(/<g class="landmark-pixels"[^>]*>(.*?)<\/g>/);
  assert(pixelGroup, `Missing ${id} pixel group`);
  const rects = rectsFrom(pixelGroup[1]);
  assert(rects.length > 0, `Missing ${id} pixel details`);
  rects.forEach(rect => assert(inside(rect, bounds), `${id} pixel escaped its icon bounds`));
  landmarkPixelCount += rects.length;
}

const person = html.match(/<symbol id="person"[\s\S]*?<\/symbol>/);
assert(person, 'Missing pixel person symbol');
rectsFrom(person[0]).forEach(rect => {
  assert(inside(rect, {left: 0, top: 0, right: 16, bottom: 30}), 'Walker pixel escaped its 16×30 sprite');
});

const trainMarkup = app.match(/group\.innerHTML = \[([\s\S]*?)\]\.join\(''\);/);
assert(trainMarkup, 'Missing pixel train markup');
rectsFrom(trainMarkup[1]).forEach(rect => {
  assert(inside(rect, {left: -20, top: -7, right: 20, bottom: 9}), 'Train pixel escaped the previously verified train footprint');
});
assert(css.includes('.train-shell { stroke: var(--ink); stroke-width: 1.6;'), 'Train outline changed beyond its verified footprint');

assert(app.includes('x="${stop.x - 6}"') && app.includes('x="${stop.x + 1}"'), 'Station pixels changed position');
assert(app.includes('while (activeArrivalIds.length > 2)'), 'Arrival animation budget must remain capped at two');
assert(!/\b(?:filter|backdrop-filter|perspective)\s*:/.test(css), 'Blur, filters, and perspective are not allowed');

console.log(`Pixel bounds verified: ${landmarkPixelCount} landmark pixels, fixed train/walker footprints, and a two-scene animation cap.`);
