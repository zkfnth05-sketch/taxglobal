import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  await page.waitForSelector('.btn-add', { timeout: 5000 });
  await page.click('.btn-add');

  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

  const fileInputs = await page.$$('input[type="file"]');
  console.log(`Found ${fileInputs.length} file inputs on page`);

  // Input at index 1 corresponds to 2021 year column!
  const pdfPath2023 = 'c:/Users/zkfnt/Desktop/노벨세무회계/2023.pdf';
  console.log('Uploading 2023.pdf INTO 2021 column input (index 1)...');
  await fileInputs[1].uploadFile(pdfPath2023);

  console.log('Waiting for processing...');
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

  const tableData = await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table'));
    const simTable = tables[tables.length - 1];
    const rows = Array.from(simTable.querySelectorAll('tbody tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const textValues = cells.map(c => {
        const input = c.querySelector('input');
        if (input) return `[Input: ${input.value || input.placeholder}]`;
        return c.textContent.trim();
      });
      return textValues.join(' | ');
    });
  });

  console.log('=== CROSS YEAR UPLOAD RESULT ===');
  console.log('Row 1 (적용연도):', tableData[1]);
  console.log('Row 2 (근무기간):', tableData[2]);
  console.log('Row 3 (근무처명):', tableData[3]);
  console.log('Row 6 (총급여):', tableData[6]);
  console.log('Row 22 (합계금액):', tableData[22]);
  console.log('=================================');

  await browser.close();
}

main().catch(console.error);
