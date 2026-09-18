const {chromium}=require('/Users/shauryapunj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 await page.goto('http://127.0.0.1:5188/',{waitUntil:'networkidle'});
 await page.waitForTimeout(1400);
 await page.screenshot({path:'qa/campaign/refinement-hero.png'});
 await page.locator('#fragrance-stories').scrollIntoViewIfNeeded();
 await page.waitForTimeout(900);
 await page.screenshot({path:'qa/campaign/refinement-story.png'});
 await page.locator('#story-next').click();
 await page.waitForTimeout(560);
 await page.screenshot({path:'qa/campaign/refinement-story-transition.png'});
 await page.waitForTimeout(1100);
 await page.locator('#collection').scrollIntoViewIfNeeded();
 await page.waitForTimeout(1500);
 await page.locator('.product-image').first().hover();
 await page.waitForTimeout(800);
 await page.screenshot({path:'qa/campaign/refinement-product-hover.png'});
 await page.locator('.craft-strip').scrollIntoViewIfNeeded();
 await page.waitForTimeout(1200);
 await page.screenshot({path:'qa/campaign/refinement-craft.png'});
 await page.locator('#gifting').scrollIntoViewIfNeeded();
 await page.waitForTimeout(1200);
 await page.screenshot({path:'qa/campaign/refinement-gifting.png'});
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
