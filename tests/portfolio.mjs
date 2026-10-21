import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');
 assert.equal(await page.locator('html').getAttribute('lang'),'fr');
 assert.equal(await page.locator('.stop').count(),6);
 const boxes=await page.locator('.stop').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}}));
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert(!(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top),'Station labels overlap')}
 await page.locator('#tour').click();
 for(let i=0;i<6;i++){
  assert.equal(await page.locator('#story-count').innerText(),`${i+1} / 6`);
  assert(await page.locator('#story-title').innerText());
  assert(await page.locator('details').count()>0);
  await page.locator('#next').click();
 }
 assert.equal(await page.locator('#story').evaluate(e=>e.open),false);
 assert.equal(await page.locator('#progress').innerText(),'6 / 6');
 await page.locator('#language').click();assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.locator('.stop[data-stop="2"]').click();assert.equal(await page.locator('#story-title').innerText(),'Learning on the ground.');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#story').evaluate(e=>e.open),false);
 const before=await page.locator('#world').getAttribute('style');await page.locator('#zoom-in').click();assert.notEqual(await page.locator('#world').getAttribute('style'),before);await page.locator('#reset').click();assert.equal(await page.locator('#world').getAttribute('style'),before);
 await page.locator('#motion').click();assert.equal(await page.locator('#motion').getAttribute('aria-pressed'),'true');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('#route-stops [data-stop="1"]').click();assert.equal(await page.locator('#story').evaluate(e=>e.open),true);await page.keyboard.press('Escape');
 assert.equal(await page.locator('a[href$=".pdf"]').count(),0);assert.deepEqual(errors,[]);
 console.log('PASS: six-stop tour, bilingual content, expandable stories, label spacing, keyboard dismissal, zoom/reset, pause, mobile layout, and no browser errors.');
}finally{await browser.close()}
