/**
 * Split a long string into fixed-size, overlapping chunks.
 *
 * Why chunk: embedding APIs and LLMs take limited input, and retrieval is
 * sharper on small focused passages than on a whole document.
 * Why overlap: a sentence split across a boundary still lands whole inside
 * at least one chunk, so we never lose an answer to an unlucky cut.
 *
 * @param {string} text     the full document text
 * @param {number} size     characters per chunk
 * @param {number} overlap  characters shared between neighbouring chunks
 * @returns {string[]}      the chunks, in document order
 */
export function chunkText(text, size = 800, overlap = 100) {
  if (typeof text !== "string") throw new TypeError("chunkText expects a string");
  if (overlap >= size) throw new RangeError("overlap must be smaller than size");

  // PDF extraction produces ragged whitespace (stray newlines, double spaces).
  // Collapsing it to single spaces makes chunks cleaner to embed and read.
  const clean = text.replace(/\s+/g, " ").trim();

  const step = size - overlap;          // how far the window advances each step
  const chunks = [];

  for (let i = 0; i < clean.length; i += step) {
    const piece = clean.slice(i, i + size).trim();
    if (piece) chunks.push(piece);      // skip any empty tail
  }
  return chunks;
}
