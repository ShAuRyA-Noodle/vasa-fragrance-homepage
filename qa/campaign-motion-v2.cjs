const {chromium}=require('/Users/shauryapunj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');

(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const results=[];
 for(const [width,height,reduced] of [[1440,1000,false],[768,900,false],[390,844,false],[320,760,true]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
  const errors=[],failed=[],mp4=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)failed.push(`${response.status()} ${response.url()}`);if(response.url().endsWith('.mp4'))mp4.push(response.url())});
  await page.goto('http://127.0.0.1:5188/',{waitUntil:'networkidle'});
  await page.waitForTimeout(1600);
  assert.equal(await page.locator('.brand-mark').isVisible(),true,`brand mark hidden at ${width}`);
  assert.equal(await page.locator('#hero-title').isVisible(),true,`hero title hidden at ${width}`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`horizontal overflow at ${width}`);
  assert.deepEqual(await page.evaluate(()=>[...document.images].filter(image=>image.complete&&!image.naturalWidth).map(image=>image.src)),[],`broken images at ${width}`);
  if(width>760){
   if(width===1440)assert.ok(await page.locator('.pin-spacer').count()>0,'pinned principles timeline was not created');
   await page.locator('.brand').hover();
   await page.waitForTimeout(750);
   assert.ok(Number(await page.locator('.brand-name').evaluate(element=>getComputedStyle(element).opacity))>.9,'brand name did not reveal');
   await page.locator('#collection').scrollIntoViewIfNeeded();
   await page.waitForTimeout(1700);
   const geometry=await page.locator('.product-card').evaluateAll(cards=>cards.map(card=>{
    const box=card.getBoundingClientRect();
    return {top:Math.round(box.top),height:Math.round(box.height)};
   }));
   assert.equal(new Set(geometry.map(card=>card.top)).size,1,'product cards are not aligned to one row');
   assert.equal(new Set(geometry.map(card=>card.height)).size,1,'product cards do not share one height');
   const first=page.locator('.product-card').first();
   const restingWorldClip=await first.locator('.product-world').evaluate(element=>getComputedStyle(element).clipPath);
   const restingBottleOpacity=Number(await first.locator('.product-bottle').evaluate(element=>getComputedStyle(element).opacity));
   assert.ok(!restingWorldClip.includes('100%'),'scenery is clipped before hover');
   assert.ok(restingBottleOpacity<.1,'bottle is visible before hover');
   await first.locator('.product-image').hover();
   await page.waitForTimeout(900);
   assert.ok(Number(await first.locator('.product-bottle').evaluate(element=>getComputedStyle(element).opacity))>.9,'bottle did not reveal on hover');
   assert.ok(Number(await first.locator('.product-world').evaluate(element=>getComputedStyle(element).opacity))>.9,'scenery disappeared on hover');
   assert.equal(await first.locator('.product-world-label').isVisible(),true,'world label hidden');
   assert.ok(Number(await first.locator('.product-world-label').evaluate(element=>getComputedStyle(element).opacity))>.9,'world label did not reveal');
   if(width===1440)await page.screenshot({path:'qa/campaign/motion-v2-1440.png'});
  }else{
   assert.equal(mp4.length,0,`mobile loaded video at ${width}`);
   await page.locator('#collection').scrollIntoViewIfNeeded();
   await page.waitForTimeout(500);
   assert.equal(await page.locator('.product-world-label').first().isVisible(),true,'mobile world label hidden');
   if(width===390)await page.screenshot({path:'qa/campaign/motion-v2-390.png'});
  }
  assert.deepEqual(errors,[],`page errors at ${width}`);
  assert.deepEqual(failed,[],`failed responses at ${width}`);
  results.push({width,height,reduced,mp4Requests:mp4.length,passed:true});
  await page.close();
 }
 await browser.close();
 fs.writeFileSync('qa/campaign/motion-v2-results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
})().catch(error=>{console.error(error);process.exit(1)});
