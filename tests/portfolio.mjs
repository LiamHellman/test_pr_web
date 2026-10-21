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
      viewport: { width: 1440, height: 1100 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173");
  await page.locator("#city").evaluate(async (img) => {
    await img.decode();
  });
  assert.equal(
    await page.locator("#city").evaluate((img) => img.naturalWidth > 1000),
    true,
  );
  assert.equal(await page.locator("html").getAttribute("lang"), "fr");
  assert.equal(await page.locator(".stop").count(), 6);
  const boxes = await page.locator(".stop").evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }),
  );
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i],
        b = boxes[j];
      assert(
        !(
          a.left < b.right &&
          a.right > b.left &&
          a.top < b.bottom &&
          a.bottom > b.top
        ),
        "Station labels overlap",
      );
    }
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
  assert.equal(await page.locator("#story").evaluate((e) => e.open), false);
  await page.locator("#reset").click();
  const before = await page.locator("#world").getAttribute("style");
  await page.locator("#zoom-in").click();
  assert.notEqual(await page.locator("#world").getAttribute("style"), before);
  await page.locator("#reset").click();
  assert.equal(await page.locator("#world").getAttribute("style"), before);
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
    "Pin text must not scale with artwork",
  );
  await page.locator("#reset").click();
  await page.locator("#zoom-in").click();
  await page.locator("#viewport").focus();
  const panBefore = await page.locator("#world").getAttribute("style");
  await page.keyboard.press("ArrowUp");
  assert.notEqual(
    await page.locator("#world").getAttribute("style"),
    panBefore,
    "Keyboard pan must move the map",
  );
  await page.locator("#reset").click();
  await page.locator("#motion").click();
  assert.equal(
    await page.locator("#motion").getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    await page
      .locator("#pepper .cat")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
    "paused",
  );
  await page.waitForTimeout(100);
  const ferryPosition = await page
    .locator(".ferry")
    .evaluate((el) => el.getBoundingClientRect().x);
  await page.waitForTimeout(250);
  assert.equal(
    await page.locator(".ferry").evaluate((el) => el.getBoundingClientRect().x),
    ferryPosition,
    "Paused ferry must remain still",
  );
  const riverLane = await page
    .locator(".ferry-lane")
    .evaluate((el) => ({
      top: parseFloat(getComputedStyle(el).top),
      height: el.parentElement.clientHeight,
      overflow: getComputedStyle(el).overflow,
    }));
  assert(
    riverLane.top / riverLane.height >= 0.96,
    "Ferry must stay in the lower open river",
  );
  assert.equal(riverLane.overflow, "hidden");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.locator('#route-stops [data-stop="1"]').click();
  assert.equal(await page.locator("#story").evaluate((e) => e.open), true);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator('a[href$=".pdf"]').count(), 0);
  // Content scrolls independently of fixed close and navigation controls.
  await page.locator('#route-stops [data-stop="2"]').click();
  await page.locator("#story-content").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  assert(await page.locator("#close").isVisible());
  assert(await page.locator("#next").isVisible());
  const bounds = await page.locator("#next").boundingBox();
  assert(bounds.y + bounds.height <= 844);
  await page.keyboard.press("Escape");
  // The user also opens index.html directly from VS Code / Explorer.
  const filePage = await browser.newPage();
  try {
    await filePage.goto(new URL("../index.html", import.meta.url).href);
    await filePage.locator("#city").evaluate(async (img) => {
      await img.decode();
    });
    await filePage.locator("#tour").click();
    assert.equal(
      await filePage.locator("#story").evaluate((e) => e.open),
      true,
    );
  } catch (error) {
    if (!error.message.includes("ERR_BLOCKED_BY_ADMINISTRATOR")) throw error;
    console.log(
      "SKIP direct-file load: managed browser policy blocks file:// navigation.",
    );
  } finally {
    await filePage.close();
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator("#pepper .cat")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: local illustration, bilingual six-stop tour, expandable stories, readable pin sizing, keyboard pan/dismissal, zoom/reset, paused and reduced motion, mobile drawer/layout, and no browser errors.",
  );
} finally {
  await browser.close();
}
