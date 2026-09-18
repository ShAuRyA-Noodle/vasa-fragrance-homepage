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
  assert.equal(await page.locator('#film-control').count(),0,'hero film control still exists');
  assert.equal(await page.locator('.hero-foot a').count(),0,'hero discover control still exists');
  assert.equal(await page.locator('#scent-cursor').count(),0,'floating Enter cursor still exists');
  assert.equal(await page.locator('.scent-rail').count(),0,'decorative marquee still exists below the hero');
  assert.equal(await page.locator('.word-loop').count(),1,'hero text loop is missing');
  assert.equal(await page.locator('.gift-curve').count(),1,'curved text loop is missing');
  assert.equal(await page.locator('.mood-gallery-panel').count(),4,'accordion gallery is incomplete');
  assert.equal(await page.locator('#click-spark-canvas').count(),1,'click spark canvas is missing');
  assert.equal(await page.locator('#footer-particle-canvas').count(),1,'footer particle typography is missing');
  assert.equal(await page.locator('#footer-topography').count(),1,'footer topography field is missing');
  assert.equal(await page.locator('.product-label,.product-index,.product-world-label').count(),0,'product artwork still contains competing micro labels');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`horizontal overflow at ${width}`);
  assert.deepEqual(await page.evaluate(()=>[...document.images].filter(image=>image.complete&&!image.naturalWidth).map(image=>image.src)),[],`broken images at ${width}`);
  if(width>760){
   if(width===1440)assert.equal(await page.locator('.craft-strip').evaluate(element=>element.parentElement.classList.contains('pin-spacer')),false,'principles section still creates a long pin spacer');
   await page.locator('.brand').hover();
   await page.waitForTimeout(750);
   assert.ok(Number(await page.locator('.brand-name').evaluate(element=>getComputedStyle(element).opacity))>.9,'brand name did not reveal');
   await page.locator('.contact-nav').hover();
   await page.waitForTimeout(600);
   const contactUnderline=await page.locator('.contact-nav').evaluate(element=>getComputedStyle(element,'::after').transform);
   assert.ok(contactUnderline==='none'||contactUnderline.startsWith('matrix(1,'),'Contact navigation animation did not complete');
   await page.locator('#story-next').click();
   await page.waitForTimeout(280);
   assert.equal(await page.locator('.story-slide:not([hidden])').count(),2,'story transition still cuts directly between slides');
   await page.waitForTimeout(1300);
   assert.equal(await page.locator('.story-slide:not([hidden])').count(),1,'story transition did not settle');
   await page.locator('#collection').scrollIntoViewIfNeeded();
   await page.waitForTimeout(1700);
   assert.equal(await page.locator('a[href="#collection"]').first().evaluate(element=>element.classList.contains('is-active')),true,'section-aware navigation did not activate Collection');
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
   assert.ok(Number(await first.locator('.product-world').evaluate(element=>getComputedStyle(element).opacity))<.08,'scenery did not clear for bottle reveal');
   await page.locator('#gifting').scrollIntoViewIfNeeded();
   await page.waitForTimeout(1200);
   const giftLefts=await page.locator('.gift-copy>.button,.gift-copy>.exclusive-link').evaluateAll(elements=>elements.map(element=>Math.round(element.getBoundingClientRect().left)));
   assert.ok(Math.max(...giftLefts)-Math.min(...giftLefts)<=2,'gifting actions are not left aligned');
   if(width===1440)await page.screenshot({path:'qa/campaign/motion-v2-1440.png'});
  }else{
   assert.equal(mp4.length,0,`mobile loaded video at ${width}`);
   await page.locator('#collection').scrollIntoViewIfNeeded();
   await page.waitForTimeout(500);
   assert.ok(Number(await page.locator('.product-bottle').first().evaluate(element=>getComputedStyle(element).opacity))<.08,'mobile card overlays bottle on scenery');
   await page.locator('.mobile-menu').click();
   await page.waitForTimeout(700);
   assert.equal(await page.locator('.menu-links').isVisible(),true,'staggered mobile menu did not open');
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
