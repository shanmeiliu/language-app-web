import { useMemo, useState } from "react";
import { generateTopicFlashcard } from "../api/flashcards";
import ErrorMessage from "../components/ErrorMessage";
import GameCard from "../components/GameCard";
import type {
  DifficultyLevel,
  FlashcardResponse,
  TopicFlashcardRequest,
} from "../types/flashcard";

const LANGUAGE_OPTIONS = [
  "Chinese",
  "English",
  "French",
  "Japanese",
  "Spanish",
];

function getDifficultyFromScore(score: number): DifficultyLevel {
  if (score >= 8) return "advanced";
  if (score >= 4) return "intermediate";
  return "beginner";
}

function getTopicFromScore(score: number): string {
  if (score >= 8) return "classical literature";
  if (score >= 4) return "idioms";
  return "daily conversation";
}

export default function GamePage() {
  const [sourceLanguage, setSourceLanguage] = useState("Chinese");
  const [targetLanguage, setTargetLanguage] = useState("English");

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [card, setCard] = useState<FlashcardResponse | null>(null);
  const [seenSourceTexts, setSeenSourceTexts] = useState<string[]>([]);

  const difficulty = useMemo(() => getDifficultyFromScore(score), [score]);
  const topic = useMemo(() => getTopicFromScore(score), [score]);

  async function fetchNextCard(
    currentScore: number,
    srcLang: string,
    tgtLang: string,
    seen: string[]
  ) {
    setLoading(true);
    setError("");

    try {
      const payload: TopicFlashcardRequest = {
        topic: getTopicFromScore(currentScore),
        difficulty: getDifficultyFromScore(currentScore),
        source_language: srcLang,
        target_language: tgtLang,
        num_options: 4,
        text_type: "phrase",
        exclude_source_texts: seen,
      };

      const res = await generateTopicFlashcard(payload);

      if (seen.includes(res.source_text)) {
        throw new Error("Received a repeated question from the backend.");
      }

      setCard(res);
      setSeenSourceTexts((prev) => [...prev, res.source_text]);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Failed to generate game card.");
      }
    } finally {
      setLoading(false);
    }
  }

  function startGame() {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setStarted(true);
    setCard(null);
    setSeenSourceTexts([]);
    fetchNextCard(0, sourceLanguage, targetLanguage, []);
  }

  function handleCorrect() {
    const nextScore = score + 1;
    setScore(nextScore);
    fetchNextCard(nextScore, sourceLanguage, targetLanguage, seenSourceTexts);
  }

  function handleWrong() {
    const nextLives = lives - 1;
    setLives(nextLives);

    if (nextLives <= 0) {
      setGameOver(true);
      return;
    }

    fetchNextCard(score, sourceLanguage, targetLanguage, seenSourceTexts);
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Challenge Mode</p>
            <h1>Flashcard Game</h1>
            <p className="muted">
              Answer correctly to increase your score. Difficulty rises as you progress.
            </p>
          </div>
        </div>

        <div className="form-grid">
          <label>
            Source Language
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              disabled={started && !gameOver}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>

          <label>
            Target Language
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              disabled={started && !gameOver}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="game-stats">
          <div className="stat-card">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Lives</span>
            <span className="stat-value hearts">
              {Array.from({ length: lives }).map((_, i) => (
                <span key={i}>❤️</span>
              ))}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Difficulty</span>
            <span className="stat-value">{difficulty}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Seen</span>
            <span className="stat-value">{seenSourceTexts.length}</span>
          </div>
        </div>

        <div className="action-row">
          {!started || gameOver ? (
            <button type="button" className="primary-button" onClick={startGame}>
              {gameOver ? "Play Again" : "Start Game"}
            </button>
          ) : null}
        </div>
      </div>

      {loading && (
        <div className="panel loading-panel">
          <div className="spinner" />
          <p>Loading next challenge...</p>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {gameOver && (
        <div className="panel game-over-panel">
          <p className="eyebrow">Game Over</p>
          <h2>Your final score: {score}</h2>
          <p className="muted">You ran out of lives. Start a new game to try again.</p>
        </div>
      )}

      {started && !gameOver && card && !loading && (
        <GameCard
          card={card}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      )}
    </div>
  );
}