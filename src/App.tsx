import { useState } from "react";
import PhrasePage from "./pages/PhrasePage";
import TopicPage from "./pages/TopicPage";

export default function App() {
  const [tab, setTab] = useState("phrase");

  return (
    <div>
      <button onClick={() => setTab("phrase")}>Phrase</button>
      <button onClick={() => setTab("topic")}>Topic</button>

      {tab === "phrase" ? <PhrasePage /> : <TopicPage />}
    </div>
  );
}