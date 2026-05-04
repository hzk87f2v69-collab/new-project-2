const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 500, height: 836 });

  try {
    await page.goto('http://localhost:5000/workout-tracker', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'scratch/screenshot1_initial.png' });
    console.log("Saved screenshot1_initial.png");

    await page.click('a[data-mode="calories"]');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'scratch/screenshot2_calories.png' });
    console.log("Saved screenshot2_calories.png");

    await page.click('a[data-mode="workout"]');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'scratch/screenshot3_workout.png' });
    console.log("Saved screenshot3_workout.png");

  } catch(e) {
    console.log("Script error:", e);
  }

  await browser.close();
})();
