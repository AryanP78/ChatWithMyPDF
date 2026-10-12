import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./Routes/authRoutes.js";
import documentRoutes from "./Routes/documentRoutes.js";
import flashcardRoutes from "./Routes/flashcardRoutes.js";
import aiRoutes from "./Routes/aiRoutes.js";
import quizRoutes from "./Routes/quizRoutes.js";
import progressRoutes from "./Routes/progressRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import connectDB from "./config/db.js";
const app = express();

connectDB();

//middleware to handle CORS

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["content-type", "authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Static Folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);

//404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    statusCode: 404,
  });
});

app.use(errorHandler);

//start Server

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(
    `Server is running on ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});
