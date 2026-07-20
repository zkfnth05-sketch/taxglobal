import fs from 'fs';
class DummyDOMMatrix {
  constructor() {
    this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
  }
}
globalThis.DOMMatrix = DummyDOMMatrix;

async function main() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync('c:/Users/zkfnt/Desktop/노벨세무회계/2022.pdf'));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += `--- PAGE ${i} ---\n` + pageText + '\n';
  }
  fs.writeFileSync('c:/Users/zkfnt/Desktop/노벨세무회계/2022_text.txt', fullText);
  console.log('Saved extracted text to 2022_text.txt');
}

main().catch(console.error);
