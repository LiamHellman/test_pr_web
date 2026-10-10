import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

const overlaps = (first, second) => (
  first.left < second.right
  && first.right > second.left
  && first.top < second.bottom
  && first.bottom > second.top
);

assert(!html.includes('id="person"'), 'The legacy smooth person symbol must stay removed');
assert(!app.includes('href="#person"'), 'Scenery must not render legacy smooth figures');
const scenePerson = app.match(/function scenePerson\([\s\S]*?\n\}/);
assert(scenePerson, 'Missing shared scene-person renderer');
assert(scenePerson[0].includes('href="#pixel-person-a"') && scenePerson[0].includes('href="#pixel-person-b"'), 'Scene figures must use both shared pixel frames');
assert((app.match(/scenePerson\(/g) || []).length >= 9, 'Every vignette needs shared pixel characters');
assert(css.includes('@keyframes scene-person-a') && css.includes('@keyframes scene-person-b'), 'Scene figures need a stepped idle cadence');
assert(css.includes('.motion-paused .scene-person-frame'), 'Scene figure animation must respect the motion control');

const buildingKinds = ['atelier', 'university', 'collective', 'cafe', 'office', 'shop'];
for (const kind of buildingKinds) {
  assert(app.includes(`kind==='${kind}'`), `Missing ${kind} building-detail definition`);
  assert(app.includes(`'${kind}')`), `Missing ${kind} building in the city`);
}
for (const detail of ['window-mullion', 'door-handle', 'masonry', 'solar-panel', 'pediment', 'roof-planter', 'awning', 'fire-escape']) {
  assert(app.includes(detail), `Missing architectural detail: ${detail}`);
  assert(css.includes(`.${detail}`), `Missing architectural styling: ${detail}`);
}

const playersBlock = app.match(/const basketballPlayers=\[([\s\S]*?)\];/);
assert(playersBlock, 'Missing explicit basketball player layout');
const players = [...playersBlock[1].matchAll(/\{x:(\d+),y:(\d+),scale:([\d.]+),color:'[^']+'\}/g)].map(match => ({
  x: Number(match[1]),
  y: Number(match[2]),
  scale: Number(match[3])
}));
assert.equal(players.length, 2, 'Basketball scene should have two clearly placed players');

const ballMatch = app.match(/const basketballBall=\{x:(\d+),y:(\d+),size:(\d+),rise:(\d+)\};/);
assert(ballMatch, 'Missing explicit basketball motion bounds');
const ball = {x: Number(ballMatch[1]), y: Number(ballMatch[2]), size: Number(ballMatch[3]), rise: Number(ballMatch[4])};
const ballEnvelope = {left: ball.x, right: ball.x + ball.size, top: ball.y - ball.rise, bottom: ball.y + ball.size};
assert(ballEnvelope.left >= 0 && ballEnvelope.right <= 116 && ballEnvelope.top >= 0 && ballEnvelope.bottom <= 64, 'Basketball escaped the court');
for (const player of players) {
  const bounds = {left: player.x, right: player.x + 18 * player.scale, top: player.y, bottom: player.y + 34 * player.scale};
  assert(!overlaps(ballEnvelope, bounds), 'Basketball motion overlaps a player sprite');
}
assert(app.indexOf('class="basketball-ball-anchor"') > app.indexOf('${courtPlayers}'), 'Basketball must render in front of the players');
assert(css.includes(`translateY(-${ball.rise}px)`), 'Basketball CSS rise must match its tested motion envelope');

const shadow = html.match(/<feDropShadow[^>]*stdDeviation="([\d.]+)"/);
assert(shadow && Number(shadow[1]) <= 3, 'Building shadows must stay crisp when zoomed');
assert((html.match(/scene-occlusion-zone/g) || []).length >= 6, 'Each architecture cluster needs an occlusion zone');

console.log('Scene cohesion verified: one pixel character system, collision-safe basketball motion, and six detailed building types.');
