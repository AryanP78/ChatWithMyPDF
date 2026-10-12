import express from "express";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  updateDocument,
} from "../controllers/documentController.js";
import protect from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/upload", protect, upload.single("document"), uploadDocument);
router.get("/", protect, getDocuments);
router.get("/:id", protect, getDocumentById);
router.delete("/:id", protect, deleteDocument);
router.put("/:id", protect, updateDocument);

export default router;
