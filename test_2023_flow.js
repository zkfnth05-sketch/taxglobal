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

  const fileInputs = await page.$$('input[type="file"]');
  console.log(`Found ${fileInputs.length} file inputs on the page`);

  const pdfPath2023 = 'c:/Users/zkfnt/Desktop/노벨세무회계/2023.pdf';
  
  // Upload to Input 3 (2023 PDF파일 선택 in the top row: index 0 bulk, index 1 2021, index 2 2022, index 3 2023)
  console.log('Uploading 2023.pdf to input index 3 (2023 year column)...');
  await fileInputs[3].uploadFile(pdfPath2023);

  console.log('Waiting for PDF analysis and calculation...');
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

  console.log('=== 2023 SIMULATION TABLE DATA ===');
  tableData.forEach((row, i) => console.log(`${i}: ${row}`));
  console.log('=================================');

  await browser.close();
}

main().catch(console.error);
