const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE LOG ERROR:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  try {
    await page.goto('http://localhost:5002/workout-tracker', { waitUntil: 'networkidle2' });
    console.log("Page loaded. Clicking CALORIES...");
    await page.click('a[data-mode="calories"]');
    await page.waitForTimeout(500);
    console.log("Clicking WORKOUT...");
    await page.click('a[data-mode="workout"]');
    await page.waitForTimeout(500);
  } catch(e) {
    console.log("Script error:", e);
  }

  await browser.close();
})();
