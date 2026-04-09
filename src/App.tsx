import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./pages/LoginPage";
import MagicLogin from "./pages/MagicLogin";
import PhrasePage from "./pages/PhrasePage";
import TopicPage from "./pages/TopicPage";
import GamePage from "./pages/GamePage";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/magic-login" element={<MagicLogin />} />

        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<PhrasePage />} />
          <Route path="/topic" element={<TopicPage />} />
          <Route path="/game" element={<GamePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}