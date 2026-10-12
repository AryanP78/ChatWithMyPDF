import fs from "fs";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from pdf file
 * @param{string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text from the PDF
 */

export const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
  try {
    const info = await parser.getInfo();
    const data = await parser.getText();
    return {
      text: data.text,
      numPages: data.total,
      info,
    };
  } catch (error) {
    throw new Error("Error extracting text from PDF: " + error.message);
  } finally {
    await parser.destroy();
  }
};
