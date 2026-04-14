import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import AuthGate from "./components/AuthGate";
import LoginPage from "./pages/LoginPage";
import MagicLogin from "./pages/MagicLogin";
import PhrasePage from "./pages/PhrasePage";
import TopicPage from "./pages/TopicPage";
import GamePage from "./pages/GamePage";
import "./index.css";

const basePath = import.meta.env.VITE_APP_BASE_PATH || "/";

export default function App() {
  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/magic-login" element={<MagicLogin />} />

        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <AuthGate>
                <PhrasePage />
              </AuthGate>
            }
          />
          <Route
            path="/topic"
            element={
              <AuthGate>
                <TopicPage />
              </AuthGate>
            }
          />
          <Route
            path="/game"
            element={
              <AuthGate>
                <GamePage />
              </AuthGate>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}