import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function main() {
  const data = new Uint8Array(fs.readFileSync('c:/Users/zkfnt/Desktop/노벨세무회계/2023.pdf'));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  console.log(`PDF Loaded: ${pdf.numPages} pages`);
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  console.log('=== EXTRACTED TEXT (First 1500 chars) ===');
  console.log(fullText.substring(0, 1500));
  console.log('======================');
  
  // Clean text
  const cleanText = fullText.replace(/\s+/g, ' ');
  console.log('Clean text length:', cleanText.length);

  const getNumbersAfterKeyword = (keywordRegex, count) => {
    const match = cleanText.match(keywordRegex);
    if (!match) {
      console.log(`Keyword match failed for: ${keywordRegex}`);
      return null;
    }
    console.log(`Keyword match success for: ${keywordRegex} -> "${match[0]}"`);
    
    const startIndex = match.index + match[0].length;
    const sub = cleanText.substring(startIndex, startIndex + 300);
    
    const numbers = [];
    const numRegex = /(\d{1,3}(?:,\d{3})+|[1-9]\d{2,15}|0)/g;
    let numMatch;
    while ((numMatch = numRegex.exec(sub)) !== null && numbers.length < count) {
      numbers.push(numMatch[0].replace(/,/g, ''));
    }
    return numbers.length > 0 ? numbers : null;
  };

  console.log('--- TEST REGEX MATCHES FOR 2023.pdf ---');
  console.log('Salary (총급여):', getNumbersAfterKeyword(/(?:⑯|16)\s*계/i, 1)
                  || getNumbersAfterKeyword(/(?:⑬|13)\s*급\s*여/i, 1)
                  || getNumbersAfterKeyword(/21\s*총\s*급\s*여/i, 1)
                  || getNumbersAfterKeyword(/총\s*급\s*여/i, 1));
  console.log('TaxBase (과세표준 49):', getNumbersAfterKeyword(/49\s*(?:종\s*합\s*소\s*득\s*)?과\s*세\s*표\s*준/i, 1)
                    || getNumbersAfterKeyword(/과\s*세\s*표\s*준/i, 1)
                    || getNumbersAfterKeyword(/(?:㉖|26|23)\s*근\s*로\s*소\s*득\s*금\s*액/i, 1));
  console.log('CalcTax (산출세액 50):', getNumbersAfterKeyword(/50\s*산\s*출\s*세\s*액/i, 1)
                    || getNumbersAfterKeyword(/산\s*출\s*세\s*액/i, 1)
                    || getNumbersAfterKeyword(/(?:㉛|31)\s*산\s*출\s*세\s*액/i, 1));
  console.log('Reduction (감면 53):', getNumbersAfterKeyword(/53\s*(?:「\s*조\s*세\s*특\s*례\s*제\s*한\s*법\s*」\s*)?제\s*3\s*0\s*조/i, 1)
                          || getNumbersAfterKeyword(/조\s*세\s*특\s*례\s*제\s*한\s*법\s*제\s*3\s*0\s*조/i, 1)
                          || getNumbersAfterKeyword(/중\s*소\s*기\s*업\s*(?:취\s*업\s*자)?\s*(?:소\s*득\s*세)?\s*감\s*면/i, 1));
  console.log('Deduction (공제 56):', getNumbersAfterKeyword(/56\s*근\s*로\s*소\s*득/i, 1)
                          || getNumbersAfterKeyword(/근\s*로\s*소\s*득\s*세\s*액\s*공\s*제/i, 1));
  console.log('DetTax (결정세액 73):', getNumbersAfterKeyword(/73\s*결\s*정\s*세\s*액/i, 2)
                  || getNumbersAfterKeyword(/72\s*결\s*정\s*세\s*액/i, 2)
                  || getNumbersAfterKeyword(/결\s*정\s*세\s*액/i, 2));
}

main().catch(console.error);
