import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

//@desc generate flashcards from a document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userID: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    //generate flashcards using geminiService
    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count),
    );

    //save flashcards to database
    const flashcardSet = await Flashcard.create({
      userID: req.user._id,
      documentID: documentId,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        ReviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(200).json({
      success: true,
      data: flashcardSet,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

//@desc generate quiz from a document
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5, title } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userID: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    //generate quiz using geminiService
    const questions = await geminiService.generateQuiz(
      document.extractedText,
      parseInt(numQuestions),
    );

    //save quiz to database
    const quiz = await Quiz.create({
      userID: req.user._id,
      documentID: documentId,
      title: title || `${document.title} - Quiz`,
      questions,
      totalQuestions: questions.length,
    });

    res.status(200).json({
      success: true,
      data: quiz,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

//desc generate summary from a document
// @route   POST /api/ai/generate-summary
// @access  Private
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userID: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    //generate summary using geminiService
    const summary = await geminiService.summarizePDF(document.extractedText);

    res.status(200).json({
      success: true,
      data: summary,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

//@desc chat with the document
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: "Document ID and question are required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userID: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    //find relevant chunks from the document
    const relevantChunks = findRelevantChunks(document.chunks, question, 3);
    const chunkIndices = relevantChunks.map((chunk) => chunk.chunkIndex);

    //get or create chat history for the document
    let chatHistory = await ChatHistory.findOne({
      userID: req.user._id,
      documentID: documentId,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userID: req.user._id,
        documentID: documentId,
        messages: [],
      });
    }

    //generate answer using geminiService
    const answer = await geminiService.chatWithDocument(
      question,
      relevantChunks,
      chatHistory.messages.slice(-10),
    );

    //save chat history to database
    chatHistory.messages.push({
      role: "user",
      content: question,
      timestamp: new Date(),
    });
    chatHistory.messages.push({
      role: "assistant",
      content: answer,
      timestamp: new Date(),
    });
    await chatHistory.save();

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id,
      },
      statusCode: 200,
      message: "Response generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc explain a concept from the document
// @route   POST /api/ai/explain-concept
// @access  Private
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: "Document ID and concept are required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userID: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    //find relevant chunks from the document
    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
    const context = relevantChunks.map((chunk) => chunk.content).join("\n");

    //generate explanation using geminiService
    const explanation = await geminiService.explainConcept(concept, context);

    res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((chunk) => chunk.chunkIndex),
      },
      statusCode: 200,
      message: "Explanation generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc get chat history for a document
// @route   GET /api/ai/chat-history/:documentId
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userID: req.user._id,
      documentID: documentId,
    });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        error: "Chat history not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory,
      statusCode: 200,
      message: "Chat history retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
