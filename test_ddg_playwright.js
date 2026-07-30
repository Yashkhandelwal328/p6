const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const query = encodeURIComponent("Chicken Hot Sour Soup professional restaurant food photography");
  await page.goto(`https://duckduckgo.com/?q=${query}&t=h_&iax=images&ia=images`);
  
  // Wait for images to load
  await page.waitForSelector('.tile--img__img');
  
  // Extract the first image url
  const imgUrl = await page.evaluate(() => {
    const img = document.querySelector('.tile--img__img');
    return img ? (img.src || img.getAttribute('data-src')) : null;
  });
  
  console.log("Found DDG Image:", imgUrl);
  await browser.close();
})();
