import { chunkText } from "./lib/chunk.js";

// Real prose (not lorem) so the output is legible.
const sample = `Retrieval-Augmented Generation grounds a language model's answers in
your own documents instead of its training data. First the document is split into
chunks and each chunk is turned into an embedding, a point in high-dimensional space
where distance stands in for difference in meaning. When a question arrives it is
embedded by the same model, and the nearest chunks are retrieved. Those chunks are
handed to the model as context, with an instruction to answer only from them. The
result is an answer you can trace back to a specific passage of the source text.`;

// Small size/overlap here so several chunks form and the overlap is visible.
// (Production default is 800 / 100.)
const chunks = chunkText(sample, 200, 40);

console.log(`input length : ${sample.length} chars`);
console.log(`chunks       : ${chunks.length}`);
chunks.forEach((c, i) => console.log(`  [${i}] ${c.length} chars`));

if (chunks.length >= 2) {
  console.log("\n--- overlap check: tail of [0] should reappear at head of [1] ---");
  console.log("tail of [0]:", JSON.stringify(chunks[0].slice(-40)));
  console.log("head of [1]:", JSON.stringify(chunks[1].slice(0, 40)));
}
