import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import ProtecteRoute from "./components/auth/ProtecteRoute";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DocumentDetailPage from "./pages/Documents/DocumentDetailPage";
import FlashcardsListPage from "./pages/Flashcards/FlashcardListpage";
import FlashcardPage from "./pages/Flashcards/FlashcardPage";
import QuizTakePage from "./pages/Quizzes/QuizTakePage";
import QuizResultPage from "./pages/Quizzes/QuizResultPage";
import DocumentListPage from "./pages/Documents/DocumentListPage";
import Profilepage from "./pages/Profile/Profilepage";
import { useAuth } from "./Context/AuthContext";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Protected Routes */}
        <Route element={<ProtecteRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/flashcards" element={<FlashcardsListPage />} />
          <Route
            path="/documents/:id/flashcards"
            element={<FlashcardPage />}
          />
          <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
          <Route
            path="/quizzes/:quizId/results"
            element={<QuizResultPage />}
          />
          <Route path="/profile" element={<Profilepage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
