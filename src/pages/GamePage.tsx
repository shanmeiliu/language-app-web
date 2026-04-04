import { useMemo, useRef, useState } from "react";
import { getNextGameQuestion } from "../api/flashcards";
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
  const [prefetching, setPrefetching] = useState(false);
  const [error, setError] = useState("");
  const [card, setCard] = useState<FlashcardResponse | null>(null);
  const [seenSourceTexts, setSeenSourceTexts] = useState<string[]>([]);

  const prefetchedCardRef = useRef<FlashcardResponse | null>(null);

  const difficulty = useMemo(() => getDifficultyFromScore(score), [score]);
  const topic = useMemo(() => getTopicFromScore(score), [score]);

  function makePayload(
    currentScore: number,
    srcLang: string,
    tgtLang: string,
    seen: string[]
  ): TopicFlashcardRequest & {
    exclude_source_texts?: string[];
    batch_size?: number;
  } {
    return {
      topic: getTopicFromScore(currentScore),
      difficulty: getDifficultyFromScore(currentScore),
      source_language: srcLang,
      target_language: tgtLang,
      num_options: 4,
      text_type: "phrase",
      exclude_source_texts: seen,
      batch_size: 5,
    };
  }

  async function fetchCard(
    currentScore: number,
    srcLang: string,
    tgtLang: string,
    seen: string[]
  ): Promise<FlashcardResponse> {
    const payload = makePayload(currentScore, srcLang, tgtLang, seen);
    return await getNextGameQuestion(payload);
  }

  async function prefetchNextCard(
    currentScore: number,
    srcLang: string,
    tgtLang: string,
    seen: string[]
  ) {
    if (gameOver) return;

    try {
      setPrefetching(true);
      const next = await fetchCard(currentScore, srcLang, tgtLang, seen);

      if (seen.includes(next.source_text)) {
        return;
      }

      prefetchedCardRef.current = next;
    } catch (err) {
      console.error("Prefetch failed:", err);
    } finally {
      setPrefetching(false);
    }
  }

  async function loadInitialCard() {
    setLoading(true);
    setError("");
    prefetchedCardRef.current = null;

    try {
      const firstCard = await fetchCard(0, sourceLanguage, targetLanguage, []);
      setCard(firstCard);
      setSeenSourceTexts([firstCard.source_text]);

      prefetchNextCard(
        0,
        sourceLanguage,
        targetLanguage,
        [firstCard.source_text]
      );
    } catch (err: any) {
      console.error(err);
      if (err?.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Failed to start game.");
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
    loadInitialCard();
  }

  async function moveToNextCard(
    nextScore: number,
    nextLives: number,
    srcLang: string,
    tgtLang: string,
    seen: string[]
  ) {
    if (nextLives <= 0) {
      setGameOver(true);
      setCard(null);
      prefetchedCardRef.current = null;
      return;
    }

    const prefetched = prefetchedCardRef.current;

    if (prefetched && !seen.includes(prefetched.source_text)) {
      setCard(prefetched);

      const updatedSeen = [...seen, prefetched.source_text];
      setSeenSourceTexts(updatedSeen);
      prefetchedCardRef.current = null;

      prefetchNextCard(nextScore, srcLang, tgtLang, updatedSeen);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const next = await fetchCard(nextScore, srcLang, tgtLang, seen);
      setCard(next);

      const updatedSeen = [...seen, next.source_text];
      setSeenSourceTexts(updatedSeen);

      prefetchNextCard(nextScore, srcLang, tgtLang, updatedSeen);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Failed to load next question.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCorrect() {
    const nextScore = score + 1;
    setScore(nextScore);

    moveToNextCard(
      nextScore,
      lives,
      sourceLanguage,
      targetLanguage,
      seenSourceTexts
    );
  }

  function handleWrong() {
    const nextLives = lives - 1;
    setLives(nextLives);

    moveToNextCard(
      score,
      nextLives,
      sourceLanguage,
      targetLanguage,
      seenSourceTexts
    );
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
            <span className="stat-label">Buffer</span>
            <span className="stat-value">
              {prefetching ? "Loading..." : prefetchedCardRef.current ? "Ready" : "Empty"}
            </span>
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
        key={card.source_text}
        card={card}
        onCorrect={handleCorrect}
        onWrong={handleWrong}
        disabled={loading}
    />
      )}
    </div>
  );
}