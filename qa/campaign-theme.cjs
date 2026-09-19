const {chromium}=require('/Users/shauryapunj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>localStorage.setItem('vasa-theme','light'));
 await page.goto('http://127.0.0.1:5188/05-campaign/',{waitUntil:'networkidle'});
 const heroHeader=await page.locator('.site-header').evaluate(element=>{const s=getComputedStyle(element);return {color:s.color,background:s.backgroundColor,blur:s.backdropFilter}});
 assert.deepEqual(heroHeader,{color:'rgb(239, 233, 225)',background:'rgba(0, 0, 0, 0)',blur:'none'});
 await page.locator('#collection').scrollIntoViewIfNeeded();
 await page.waitForTimeout(400);
 const lightHeader=await page.locator('.site-header').evaluate(element=>{const s=getComputedStyle(element);return {color:s.color,background:s.backgroundColor}});
 assert.deepEqual(lightHeader,{color:'rgb(239, 233, 225)',background:'rgb(17, 16, 15)'});
 const lightFooter=await page.locator('footer').evaluate(element=>{const s=getComputedStyle(element);return {background:s.backgroundColor,color:s.color}});
 assert.notEqual(lightFooter.background,'rgb(17, 16, 15)');
 assert.notEqual(lightFooter.color,'rgb(239, 233, 225)');
 await page.evaluate(()=>{localStorage.setItem('vasa-theme','dark');document.querySelector('.theme-toggle').click()});
 await page.waitForTimeout(400);
 await page.locator('#collection').scrollIntoViewIfNeeded();
 const darkHeader=await page.locator('.site-header').evaluate(element=>{const s=getComputedStyle(element);return {color:s.color,background:s.backgroundColor}});
 assert.equal(darkHeader.background,'rgb(239, 233, 225)');
 assert.notEqual(darkHeader.color,'rgb(239, 233, 225)');
 assert.deepEqual(errors,[]);
 await browser.close();
 console.log('campaign theme checks passed');
})().catch(error=>{console.error(error);process.exit(1)});
