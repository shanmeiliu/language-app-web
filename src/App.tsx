import { useState } from "react";
import PhrasePage from "./pages/PhrasePage";
import TopicPage from "./pages/TopicPage";
import "./index.css";

export default function App() {
  const [tab, setTab] = useState<"phrase" | "topic">("phrase");

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Language Learning App</p>
          <h1 className="app-title">AI Flashcards</h1>
        </div>

        <div className="tab-row">
          <button
            type="button"
            className={tab === "phrase" ? "tab-button active" : "tab-button"}
            onClick={() => setTab("phrase")}
          >
            Phrase
          </button>
          <button
            type="button"
            className={tab === "topic" ? "tab-button active" : "tab-button"}
            onClick={() => setTab("topic")}
          >
            Topic
          </button>
        </div>
      </header>

      <main>{tab === "phrase" ? <PhrasePage /> : <TopicPage />}</main>
    </div>
  );
}