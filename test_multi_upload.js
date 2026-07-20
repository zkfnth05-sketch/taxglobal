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

  console.log('Clicking "신규등록" button...');
  await page.click('.btn-add');

  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

  // Look for input with multiple attribute or hidden bulk input
  const fileInputs = await page.$$('input[type="file"][multiple]');
  console.log(`Found ${fileInputs.length} multiple-file inputs on page`);

  const pdfPath2022 = 'c:/Users/zkfnt/Desktop/노벨세무회계/2022.pdf';
  const pdfPath2023 = 'c:/Users/zkfnt/Desktop/노벨세무회계/2023.pdf';

  if (fileInputs.length > 0) {
    console.log('Uploading 2022.pdf and 2023.pdf simultaneously using bulk input...');
    await fileInputs[0].uploadFile(pdfPath2022, pdfPath2023);
  }

  console.log('Waiting for multi-file PDF processing...');
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));

  const tableData = await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table'));
    if (tables.length === 0) return ['No tables found'];
    const simTable = tables[tables.length - 1];
    const rows = Array.from(simTable.querySelectorAll('tbody tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const textValues = cells.map(c => {
        const input = c.querySelector('input');
        if (input) {
          return `[Input: ${input.value || input.placeholder}]`;
        }
        return c.textContent.trim();
      });
      return textValues.join(' | ');
    });
  });

  console.log('=== MULTI-PDF SIMULATION TABLE RESULT ===');
  tableData.forEach((row, i) => console.log(`${i}: ${row}`));
  console.log('========================================');

  await browser.close();
}

main().catch(console.error);
