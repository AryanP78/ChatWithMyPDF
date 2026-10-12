// services/geminiService.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set — AI endpoints will fail");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini model
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_LLM_MODEL || "gemini-3.8-flash",
});

// Same model, but forced to reply with JSON
const jsonModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_LLM_MODEL || "gemini-3.8-flash",
  generationConfig: { responseMimeType: "application/json" },
});

// Retry transient Gemini errors (rate limits / overloaded model) with backoff
const generate = async (m, prompt, retries = 3) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await m.generateContent(prompt);
    } catch (error) {
      const transient = [429, 500, 503].includes(error.status);
      if (!transient || attempt >= retries) throw error;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
};

const DIFFICULTIES = ["easy", "medium", "hard"];

const normalizeDifficulty = (value) => {
  const d = String(value || "").toLowerCase();
  return DIFFICULTIES.includes(d) ? d : "medium";
};

const parseJSONArray = (raw) => {
  const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const parsed = JSON.parse(cleaned);
  const arr = Array.isArray(parsed)
    ? parsed
    : Object.values(parsed).find(Array.isArray);
  if (!arr) throw new Error("Gemini response did not contain an array");
  return arr;
};

/**
 * Ask Gemini a general question
 */
export const generateResponse = async (prompt) => {
  try {
    const result = await generate(model, prompt);

    const response = result.response;

    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);

    throw new Error("Failed to generate response from Gemini");
  }
};

/**
 * Chat with PDF content
 *
 * @param {string} pdfText - Extracted text from PDF
 * @param {string} question - User's question
 * @param {Array} chatHistory - Previous conversation
 */
export const chatWithPDF = async (pdfText, question, chatHistory = []) => {
  try {
    const systemPrompt = `
You are an AI Learning Assistant.

Your job is to help students understand the uploaded study material.

You must:
1. Answer questions using the provided PDF content.
2. Explain difficult concepts in simple language.
3. Give examples wherever useful.
4. Break complicated topics into steps.
5. If the answer is not present in the PDF, clearly say that.
6. Do not make up information.
7. When appropriate, provide exam-oriented explanations.
8. Help the student learn rather than just giving short answers.

PDF CONTENT:
--------------------
${pdfText}
--------------------

`;

    // Convert previous messages into a readable format
    const historyText = chatHistory
      .map((message) => {
        return `${message.role}: ${message.content}`;
      })
      .join("\n");

    const prompt = `
${systemPrompt}

PREVIOUS CONVERSATION:
${historyText}

CURRENT QUESTION:
${question}

Answer the student's question clearly.
`;

    const result = await generate(model, prompt);

    return result.response.text();
  } catch (error) {
    console.error("Gemini PDF Chat Error:", error);

    throw new Error("Failed to generate answer from Gemini");
  }
};

/**
 * Chat using only the most relevant chunks of a document
 *
 * @param {string} question - User's question
 * @param {Array<{content: string}>} chunks - Relevant chunks
 * @param {Array} chatHistory - Previous conversation
 */
export const chatWithDocument = async (question, chunks, chatHistory = []) => {
  const context = chunks.map((chunk) => chunk.content).join("\n\n---\n\n");
  return chatWithPDF(context, question, chatHistory);
};

/**
 * Explain a concept using document context
 */
export const explainConcept = async (concept, context) => {
  try {
    const prompt = `
You are an AI Learning Assistant.

Explain the concept "${concept}" to a student using the study material below.
Use simple language, give an example, and break it into steps if helpful.
If the material does not cover the concept, say so before giving a general explanation.

Study Material:
--------------------
${context}
--------------------
`;

    const result = await generate(model, prompt);

    return result.response.text();
  } catch (error) {
    console.error("Gemini Explain Error:", error);

    throw new Error("Failed to explain concept");
  }
};

/**
 * Generate a summary of a PDF
 */
export const summarizePDF = async (pdfText) => {
  try {
    const prompt = `
You are an AI Learning Assistant.

Summarize the following study material.

Create the summary in this format:

# Overview

# Important Concepts

# Key Definitions

# Important Formulas

# Examples

# Exam Important Points

# Quick Revision

Study Material:
--------------------
${pdfText}
--------------------
`;

    const result = await generate(model, prompt);

    return result.response.text();
  } catch (error) {
    console.error("Gemini Summary Error:", error);

    throw new Error("Failed to summarize PDF");
  }
};

/**
 * Generate quiz questions from PDF
 * @returns {Promise<Array<{question, options, correctAnswer, explanation, difficulty}>>}
 */
export const generateQuiz = async (pdfText, numberOfQuestions = 10) => {
  try {
    const prompt = `
You are an AI Learning Assistant.

Create ${numberOfQuestions} multiple-choice questions
from the following study material.

Return ONLY a JSON array. Each item must have exactly these keys:
- "question": string
- "options": array of 4 strings
- "correctAnswer": string, exactly equal to one of the options
- "explanation": string
- "difficulty": one of "easy", "medium", "hard"

Make the questions educational and suitable
for a college-level student.

Study Material:
--------------------
${pdfText}
--------------------
`;

    const result = await generate(jsonModel, prompt);

    return parseJSONArray(result.response.text()).map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      difficulty: normalizeDifficulty(q.difficulty),
    }));
  } catch (error) {
    console.error("Gemini Quiz Error:", error);

    throw new Error("Failed to generate quiz");
  }
};

/**
 * Generate flashcards from PDF
 * @returns {Promise<Array<{question, answer, difficulty}>>}
 */
export const generateFlashcards = async (pdfText, count = 10) => {
  try {
    const prompt = `
You are an AI Learning Assistant.

Create ${count} useful flashcards from this study material.

Return ONLY a JSON array. Each item must have exactly these keys:
- "question": string
- "answer": string
- "difficulty": one of "easy", "medium", "hard"

Focus on:
- Important definitions
- Concepts
- Formulas
- Important facts
- Exam-oriented material

Study Material:
--------------------
${pdfText}
--------------------
`;

    const result = await generate(jsonModel, prompt);

    return parseJSONArray(result.response.text()).map((card) => ({
      question: card.question,
      answer: card.answer,
      difficulty: normalizeDifficulty(card.difficulty),
    }));
  } catch (error) {
    console.error("Gemini Flashcard Error:", error);

    throw new Error("Failed to generate flashcards");
  }
};
