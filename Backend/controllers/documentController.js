import Document from "../models/Document.js";
import { AppError } from "../middleware/errorHandler.js";
import fs from "fs/promises";
import path from "path";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import Flashcard from "../models/Flashcard.js";
import { chunkText } from "../utils/textChunker.js";
import mongoose from "mongoose";
import ChatHistory from "../models/ChatHistory.js";

// @desc    Upload a new document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const { originalname, filename, path: filePath, size } = req.file;

    const document = new Document({
      userID: req.user._id,
      title: req.body.title?.trim() || path.parse(originalname).name,
      fileName: filename,
      fileSize: size,
      filePath: filePath,
    });

    await document.save();

    // Extract text and chunk it so the AI endpoints can use the document
    try {
      const { text } = await extractTextFromPDF(filePath);
      document.extractedText = text;
      document.chunks = chunkText(text);
      document.status = "ready";
    } catch (processingError) {
      console.error("Error processing PDF:", processingError);
      document.status = "failed";
    }

    await document.save();

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully",
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        console.log("File deleted successfully");
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    next(error);
  }
};

// @desc    Get all documents for a user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      { $match: { userID: req.user._id } },
      {
        $lookup: {
          from: "flashcards", // Name of the collection to join with
          localField: "_id",
          foreignField: "documentID",
          as: "flashcards_Set",
        },
      },
      {
        $lookup: {
          from: "quizzes", // Name of the collection to join with
          localField: "_id",
          foreignField: "documentID",
          as: "quiz_Set",
        },
      },
      {
        $addFields: {
          flashcardsCount: { $size: "$flashcards_Set" },
          quizCount: { $size: "$quiz_Set" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcards_Set: 0,
          quiz_Set: 0,
        },
      },
      { $sort: { uploadDate: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: documents,
      message: "Documents fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc  get single document with chunks
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = async (req, res, next) => {
  try {
    const documentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return next(new AppError("Invalid document ID", 400));
    }

    const document = await Document.findOne({
      _id: documentId,
      userID: req.user._id,
    });

    if (!document) {
      return next(new AppError("Document not found", 404));
    }

    const flashcardsCount = await Flashcard.countDocuments({
      documentID: document._id,
      userID: req.user._id,
    });

    const quizCount = await Quiz.countDocuments({
      documentID: document._id,
      userID: req.user._id,
    });

    //combine document with flashcardsCount and quizCount
    const documentData = document.toObject();
    documentData.flashcardsCount = flashcardsCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: {
        document: documentData,
      },
      message: "Document fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return next(new AppError("Invalid document ID", 400));
    }

    const document = await Document.findOneAndDelete({
      _id: documentId,
      userID: req.user._id,
    });

    if (!document) {
      return next(new AppError("Document not found", 404));
    }

    // Remove generated study material for this document
    await Promise.all([
      Flashcard.deleteMany({ documentID: document._id }),
      Quiz.deleteMany({ documentID: document._id }),
      ChatHistory.deleteMany({ documentID: document._id }),
    ]);

    // Delete the file from the server
    try {
      await fs.unlink(document.filePath);
      console.log("File deleted successfully");
    } catch (unlinkError) {
      console.error("Error deleting file:", unlinkError);
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return next(new AppError("Invalid document ID", 400));
    }

    const document = await Document.findOneAndUpdate(
      { _id: documentId, userID: req.user._id },
      { title: req.body.title },
      { returnDocument: "after", runValidators: true },
    );

    if (!document) {
      return next(new AppError("Document not found", 404));
    }

    res.status(200).json({
      success: true,
      data: document,
      message: "Document updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
