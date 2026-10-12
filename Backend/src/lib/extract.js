import { PDFParse } from "pdf-parse";

/**
 * Extract the full text of a PDF.
 *
 * Takes the raw bytes (a Buffer or Uint8Array) rather than a file path, so the
 * same function works for an uploaded file in memory (multer gives us a buffer)
 * as for a file on disk.
 *
 * Returns { text, pages }. `text` is "" when the PDF has no extractable text —
 * typically a scanned / image-only PDF. Detecting that empty case is what lets
 * us show a clear error later instead of silently indexing nothing.
 *
 * @param {Buffer|Uint8Array} data  raw PDF bytes
 * @returns {Promise<{ text: string, pages: number }>}
 */
export async function extractPdfText(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();      // TextResult: { text, pages, total }
    return { text: (result.text || "").trim(), pages: result.total };
  } finally {
    await parser.destroy();                      // release pdf.js worker + memory
  }
}
