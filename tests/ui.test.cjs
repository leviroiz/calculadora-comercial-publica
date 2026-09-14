const {chromium}=require('playwright');const assert=require('node:assert/strict');const {pathToFileURL}=require('node:url');const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));let checks=0;
 const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
 await page.goto(process.env.DEMO_URL||pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 eq(await page.locator('input').count(),6);
 await page.locator('#order-gross').fill('1000');await page.locator('#qty-DEMO-A').fill('4');await page.locator('#payment-pix').check();
 for(const [id,value] of [['final-total','940,40'],['pix-progressive-saving','24,00'],['pix-remainder-saving','35,60'],['pix-total-saving','59,60']]){assert.ok((await page.locator('#'+id).innerText()).includes(value));checks++;}
 eq(await page.locator('#pix-scenario').isVisible(),true);
 await page.locator('#payment-pix').uncheck();assert.ok((await page.locator('#final-total').innerText()).includes('976,00'));checks++;
 eq(await page.locator('#pix-scenario').isVisible(),false);
 await page.locator('#order-gross').fill('1');assert.match(await page.locator('#error').innerText(),/ultrapassa/);checks++;eq(await page.locator('#final-total').innerText(),'—');
 await page.locator('#order-gross').fill('1000');await page.locator('#qty-DEMO-A').fill('1.5');assert.match(await page.locator('#error').innerText(),/inteira/);checks++;
 await page.locator('#qty-DEMO-A').fill('4');await page.locator('#payment-pix').focus();await page.keyboard.press('Space');eq(await page.locator('#payment-pix').isChecked(),true);
 await page.locator('#theme-toggle').click();const theme=await page.locator('html').getAttribute('data-theme');await page.reload();eq(await page.locator('html').getAttribute('data-theme'),theme);
 await page.locator('#order-gross').fill('1000');await page.locator('#qty-DEMO-A').fill('4');await page.locator('#payment-pix').check();
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});for(const theme of ['light','dark']){
  await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`${width}-${theme}.png`),fullPage:true});
 }}
 eq(errors,[]);await browser.close();console.log(`${checks} verificações de UI passaram (3 larguras × 2 temas).`);
})().catch(e=>{console.error(e);process.exit(1)});
