import { readFile } from "node:fs/promises";
import { extractPdfText } from "./lib/extract.js";
import { chunkText } from "./lib/chunk.js";

const path = process.argv[2] || "sample.pdf";
const buffer = await readFile(path);

const { text, pages } = await extractPdfText(buffer);
console.log(`file    : ${path}`);
console.log(`pages   : ${pages}`);
console.log(`chars   : ${text.length}`);
console.log(`preview : ${JSON.stringify(text.slice(0, 180))}`);

if (!text) {
  console.log("\n⚠  No extractable text — looks like a scanned/image-only PDF. (OCR is a stretch-phase feature.)");
} else {
  const chunks = chunkText(text);
  console.log(`\nchunked into ${chunks.length} piece(s) at the default 800/100.`);
}
