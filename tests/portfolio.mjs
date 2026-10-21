import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1050 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173");
  await page.waitForFunction(() => window.MontrealScene?.debug().time > 0);
  assert.equal(await page.locator("html").getAttribute("lang"), "fr");
  assert.equal(
    await page.locator("#world img, #world image").count(),
    0,
    "The city must be a scene, not a background image",
  );
  assert(
    (await page.locator("#city .city-object").count()) > 140,
    "Expected separate terrain, architecture and props",
  );
  assert.equal(await page.locator(".stop").count(), 6);
  assert((await page.locator('.landmark[role="button"]').count()) >= 6);
  // Validate the actual shared world geometry, independent of drawing code.
  const collisions = await page.evaluate(() => {
    const d = MontrealScene.debug(),
      hits = [];
    const blocked = (u, v) =>
      d.footprints.find(
        (f) =>
          u > f.u + 0.01 &&
          u < f.u + f.w - 0.01 &&
          v > f.v + 0.01 &&
          v < f.v + f.d - 0.01,
      );
    for (const [from, to] of d.edges) {
      const a = d.nodes[from],
        b = d.nodes[to];
      for (let i = 0; i <= 100; i++) {
        const t = i / 100,
          u = a.u + (b.u - a.u) * t,
          v = a.v + (b.v - a.v) * t;
        if (blocked(u, v))
          hits.push({
            kind: "sidewalk",
            from,
            to,
            u,
            v,
            building: blocked(u, v),
          });
      }
    }
    for (let k = 0; k < d.roads.traffic.length; k++) {
      const a = d.roads.traffic[k],
        b = d.roads.traffic[(k + 1) % d.roads.traffic.length];
      for (let i = 0; i <= 100; i++) {
        const t = i / 100,
          u = a.u + (b.u - a.u) * t,
          v = a.v + (b.v - a.v) * t;
        // Vehicle extents must also remain outside footprints, not only its centre.
        for (const du of [0, a.u === b.u ? 0.4 : 1.25])
          for (const dv of [0, a.u === b.u ? 1.25 : 0.4])
            if (blocked(u + du, v + dv))
              hits.push({ kind: "traffic", k, u, v });
      }
    }
    return hits;
  });
  assert.deepEqual(
    collisions,
    [],
    "A walking or driving route crosses a building",
  );
  const graph = await page.evaluate(() => MontrealScene.debug());
  assert.equal(graph.paths.length, 6);
  for (let i = 0; i < 6; i++)
    assert.equal(
      graph.paths[i].at(-1),
      graph.targetNodes[i],
      "Every stop must be reachable",
    );
  assert(graph.destinations[5].z > 80, "The mountain stop must be elevated");
  // Bus, wheel and basketball are moving parts of their scene objects.
  const movingBefore = await page.evaluate(() => ({
    car: document
      .querySelector('[data-actor="traffic-0"]')
      .getAttribute("transform"),
    wheel: document.querySelector("#wheel-spokes").getAttribute("transform"),
    time: MontrealScene.debug().time,
  }));
  await page.waitForTimeout(450);
  const movingAfter = await page.evaluate(() => ({
    car: document
      .querySelector('[data-actor="traffic-0"]')
      .getAttribute("transform"),
    wheel: document.querySelector("#wheel-spokes").getAttribute("transform"),
    time: MontrealScene.debug().time,
  }));
  assert(movingAfter.time > movingBefore.time);
  assert.notEqual(movingAfter.car, movingBefore.car);
  assert.notEqual(movingAfter.wheel, movingBefore.wheel);
  // Activate the university itself, rather than its floating marker.
  await page.locator('.landmark[data-stop="1"]').focus();
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(() => document.activeElement?.dataset.stop),
    "1",
    "Scene depth changes must preserve keyboard focus",
  );
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#story-count").innerText(), "2 / 6");
  const catBefore = await page.evaluate(() => MontrealScene.debug().pepper);
  await page.waitForTimeout(350);
  const catAfter = await page.evaluate(() => MontrealScene.debug().pepper);
  assert(
    Math.hypot(catAfter.u - catBefore.u, catAfter.v - catBefore.v) > 0,
    "Pepper must walk toward the destination",
  );
  assert(
    Math.hypot(catAfter.u - catBefore.u, catAfter.v - catBefore.v) < 2,
    "Pepper must not jump straight across the city",
  );
  await page.keyboard.press("Escape");
  await page.locator("#tour").click();
  for (let i = 0; i < 6; i++) {
    assert.equal(
      await page.locator("#story-count").innerText(),
      `${i + 1} / 6`,
    );
    assert(await page.locator("#story-title").innerText());
    assert((await page.locator("details").count()) > 0);
    await page.locator("#next").click();
  }
  assert.equal(await page.locator("#story").evaluate((e) => e.open), false);
  assert.equal(await page.locator("#progress").innerText(), "6 / 6");
  await page.locator("#language").click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  await page.locator('#route-stops [data-stop="2"]').click();
  assert.equal(
    await page.locator("#story-title").innerText(),
    "Learning on the ground.",
  );
  await page.keyboard.press("Escape");
  await page.locator("#reset").click();
  const before = await page.locator("#world").getAttribute("style");
  await page.locator("#zoom-in").click();
  assert.notEqual(await page.locator("#world").getAttribute("style"), before);
  const pinSize = await page
    .locator(".stop")
    .first()
    .evaluate((e) => e.getBoundingClientRect().width);
  await page.locator("#zoom-in").click();
  assert.equal(
    await page
      .locator(".stop")
      .first()
      .evaluate((e) => e.getBoundingClientRect().width),
    pinSize,
  );
  await page.locator("#viewport").focus();
  const panBefore = await page.locator("#world").getAttribute("style");
  await page.keyboard.press("ArrowUp");
  assert.notEqual(
    await page.locator("#world").getAttribute("style"),
    panBefore,
  );
  await page.locator("#reset").click();
  assert.equal(await page.locator("#world").getAttribute("style"), before);
  await page.locator("#motion").click();
  assert.equal(
    await page.locator("#motion").getAttribute("aria-pressed"),
    "true",
  );
  const frozen = await page.locator("#city-depth").innerHTML();
  const frozenTime = await page.evaluate(() => MontrealScene.debug().time);
  await page.waitForTimeout(350);
  assert.equal(await page.locator("#city-depth").innerHTML(), frozen);
  assert.equal(
    await page.evaluate(() => MontrealScene.debug().time),
    frozenTime,
  );
  await page.locator("#motion").click();
  await page.waitForTimeout(200);
  assert((await page.evaluate(() => MontrealScene.debug().time)) > frozenTime);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.locator('#route-stops [data-stop="2"]').click();
  await page.locator("#story-content").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  for (const selector of ["#close", "#next"]) {
    const r = await page.locator(selector).boundingBox();
    assert(
      r.y >= 0 && r.y + r.height <= 844,
      "Drawer controls must stay on screen",
    );
  }
  await page.keyboard.press("Escape");
  assert.equal(await page.locator('a[href$=".pdf"]').count(), 0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => MontrealScene.debug().paused);
  assert.equal(await page.evaluate(() => MontrealScene.debug().paused), true);
  await page.locator('#route-stops [data-stop="5"]').click();
  assert.equal(
    await page.evaluate(() => MontrealScene.debug().pepper.z),
    96,
    "Reduced motion selects the mountain without walking",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: scene geometry, all six reachable stops, collision-free sidewalks and traffic, live bus/wheel, walking Pepper, clickable buildings, bilingual tour, pan/zoom, fully frozen pause, reduced motion and mobile panels.",
  );
} finally {
  await browser.close();
}
