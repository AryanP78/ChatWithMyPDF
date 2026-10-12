import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getQuizzesForDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZ.GET_QUIZZES_FOR_DOC(documentId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch quizzes" };
  }
};

const getQuizById = async (quizId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZ.GET_QUIZ_BY_ID(quizId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch quiz" };
  }
};

const submitQuiz = async (quizId, answers) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.QUIZ.SUBMIT_QUIZ(quizId),
      { answers },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit quiz" };
  }
};

const getQuizResults = async (quizId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZ.GET_QUIZ_RESULTS(quizId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch quiz results" };
  }
};

const deleteQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.QUIZ.DELETE_QUIZ(quizId),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete quiz" };
  }
};

export default {
  getQuizzesForDocument,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};
