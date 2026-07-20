// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ParsedPdfResult {
  year: string;
  name: string;
  foreignerNumber: string;
  workPlace: string;
  businessNumber: string;
  workPeriod: string;
  salaryTotal: string;
  taxBase: string;
  decisionTax: string;
  childReduction: string;
  childDeduction: string;
  determinedIncomeTax: string;
  determinedLocalTax: string;
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
};

export const parsePdfText = (text: string, targetYear?: string): ParsedPdfResult => {
  const cleanText = text.replace(/\s+/g, ' ');

  const getNumbersAfterKeyword = (keywordRegex: RegExp, count: number): string[] | null => {
    const match = cleanText.match(keywordRegex);
    if (!match) return null;
    
    const startIndex = match.index! + match[0].length;
    const sub = cleanText.substring(startIndex, startIndex + 300);
    
    const numbers: string[] = [];
    const numRegex = /(\d{1,3}(?:,\d{3})+|[1-9]\d{2,15}|0)/g;
    let numMatch;
    while ((numMatch = numRegex.exec(sub)) !== null && numbers.length < count) {
      numbers.push(numMatch[0].replace(/,/g, ''));
    }
    return numbers.length > 0 ? numbers : null;
  };

  // 1. 근무기간 및 귀속연도
  let year = targetYear || '';
  let workPeriod = '';
  const periodMatch = cleanText.match(/(?:근\s*무\s*기\s*간|근무기간)\s*(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2}|\d{2}-\d{2})/);
  if (periodMatch) {
    const start = periodMatch[1];
    let end = periodMatch[2];
    if (end.length === 5) { // MM-DD format
      const startYear = start.substring(0, 4);
      end = `${startYear}-${end}`;
    }
    workPeriod = `${start} ~ ${end}`;
    if (!year) {
      year = start.substring(0, 4);
    }
  }

  // Fallback for year
  if (!year) {
    const yearMatch = cleanText.match(/(202\d)\s*(?:년)?\s*귀\s*속/i) || cleanText.match(/귀\s*속\s*(?:연\s*도)?\s*(202\d)/i);
    if (yearMatch) {
      year = yearMatch[1];
    }
  }

  // 2. 소득자 정보 (성명, 주민등록번호)
  let name = '';
  const nameMatch = cleanText.match(/(?:성\s*명|소\s*득\s*자\s*성\s*명)\s*[:：]?\s*([가-힣A-Za-z\s]+?)(?=\s*[^가-힣A-Za-z\s]|$)/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }
  
  let foreignerNumber = '';
  const rrnMatch = cleanText.replace(/\s/g, '').match(/(\d{6}-\d{7})/);
  if (rrnMatch) {
    foreignerNumber = rrnMatch[1];
  }

  // 3. 근무처 정보 (회사명, 사업자등록번호)
  let workPlace = '';
  const compMatch = cleanText.match(/(?:법\s*인\s*명\s*\(상\s*호\)|상\s*호|징\s*수\s*의\s*무\s*자\s*상\s*호)\s*([가-힣A-Za-z0-9인주식회사㈜()\s]+?)(?=\s*[^가-힣A-Za-z0-9인주식회사㈜()\s]|$)/i);
  if (compMatch) {
    workPlace = compMatch[1].trim();
  }
  
  let businessNumber = '';
  const bizMatch = cleanText.replace(/\s/g, '').match(/(\d{3}-\d{2}-\d{5})/);
  if (bizMatch) {
    businessNumber = bizMatch[1];
  }

  // 5. 급여 및 소득 정보 (총급여, 과세표준, 산출세액, 감면/공제액)
  const salaryNums = getNumbersAfterKeyword(/(?:⑯|16)\s*계/i, 1)
                  || getNumbersAfterKeyword(/(?:⑬|13)\s*급\s*여/i, 1)
                  || getNumbersAfterKeyword(/21\s*총\s*급\s*여/i, 1)
                  || getNumbersAfterKeyword(/총\s*급\s*여/i, 1);
  const salaryTotal = salaryNums ? salaryNums[0] : '0';

  const taxBaseNums = getNumbersAfterKeyword(/49\s*(?:종\s*합\s*소\s*득\s*)?과\s*세\s*표\s*준/i, 1)
                    || getNumbersAfterKeyword(/과\s*세\s*표\s*준/i, 1)
                    || getNumbersAfterKeyword(/(?:㉖|26|23)\s*근\s*로\s*소\s*득\s*금\s*액/i, 1);
  const taxBase = taxBaseNums ? taxBaseNums[0] : '0';

  const calcTaxNums = getNumbersAfterKeyword(/50\s*산\s*출\s*세\s*액/i, 1)
                    || getNumbersAfterKeyword(/산\s*출\s*세\s*액/i, 1)
                    || getNumbersAfterKeyword(/(?:㉛|31)\s*산\s*출\s*세\s*액/i, 1);
  const decisionTax = calcTaxNums ? calcTaxNums[0] : '0';

  const childReductionNums = getNumbersAfterKeyword(/53\s*(?:「\s*조\s*세\s*특\s*례\s*제\s*한\s*법\s*」\s*)?제\s*3\s*0\s*조/i, 1)
                          || getNumbersAfterKeyword(/조\s*세\s*특\s*례\s*제\s*한\s*법\s*제\s*3\s*0\s*조/i, 1)
                          || getNumbersAfterKeyword(/중\s*소\s*기\s*업\s*(?:취\s*업\s*자)?\s*(?:소\s*득\s*세)?\s*감\s*면/i, 1);
  const childReduction = childReductionNums ? childReductionNums[0] : '0';

  const childDeductionNums = getNumbersAfterKeyword(/56\s*근\s*로\s*소\s*득/i, 1)
                          || getNumbersAfterKeyword(/근\s*로\s*소\s*득\s*세\s*액\s*공\s*제/i, 1);
  const childDeduction = childDeductionNums ? childDeductionNums[0] : '0';

  const detTaxNums = getNumbersAfterKeyword(/73\s*결\s*정\s*세\s*액/i, 2)
                  || getNumbersAfterKeyword(/72\s*결\s*정\s*세\s*액/i, 2)
                  || getNumbersAfterKeyword(/결\s*정\s*세\s*액/i, 2);
  
  const determinedIncomeTax = detTaxNums ? detTaxNums[0] : '0';
  const determinedLocalTax = detTaxNums ? detTaxNums[1] : String(Math.round(Number(determinedIncomeTax) * 0.1));

  return {
    year,
    name,
    foreignerNumber,
    workPlace,
    businessNumber,
    workPeriod,
    salaryTotal,
    taxBase,
    decisionTax,
    childReduction,
    childDeduction,
    determinedIncomeTax,
    determinedLocalTax
  };
};
