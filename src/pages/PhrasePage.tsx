import { useState } from "react";
import { generatePhraseFlashcard } from "../api/flashcards";
import FlashcardResult from "../components/FlashcardResult";
import ErrorMessage from "../components/ErrorMessage";
import type { FlashcardResponse } from "../types/flashcard";

const LANGUAGE_OPTIONS = [
  "Chinese",
  "English",
  "French",
  "Japanese",
  "Spanish",
];

const TEXT_TYPE_OPTIONS = [
  "phrase",
  "idiom",
  "proverb",
  "sentence",
];

const SAMPLE_PHRASES_BY_LANGUAGE: Record<string, string> = {
  Chinese: "守株待兔\n杞人忧天",
  English: "Break the ice\nOnce in a blue moon",
  French: "Avoir le cafard\nPoser un lapin",
  Japanese: "猿も木から落ちる\n七転び八起き",
  Spanish: "Más vale tarde que nunca\nEstar en las nubes",
};

const MAX_SESSION_CARDS = 6;

export default function PhrasePage() {
  const [sourceLanguage, setSourceLanguage] = useState("Chinese");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [phrases, setPhrases] = useState(
    SAMPLE_PHRASES_BY_LANGUAGE["Chinese"]
  );
  const [numOptions, setNumOptions] = useState(4);
  const [textType, setTextType] = useState("idiom");

  const [loading, setLoading] = useState(false);
  const [loadingAnother, setLoadingAnother] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FlashcardResponse | null>(null);
  const [seenSourceTexts, setSeenSourceTexts] = useState<string[]>([]);

  const isSameLanguage = sourceLanguage === targetLanguage;
  const samplePlaceholder =
    SAMPLE_PHRASES_BY_LANGUAGE[sourceLanguage] ||
    "Enter sample phrases, one per line";

  async function requestFlashcard(
    showInitialLoading: boolean,
    excludeSeen: boolean = true
  ) {
    if (isSameLanguage) {
      setError("Source and target language cannot be the same.");
      return;
    }

    if (showInitialLoading) {
      setLoading(true);
    } else {
      setLoadingAnother(true);
    }

    setError("");

    try {
      const sourceItems = phrases
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await generatePhraseFlashcard({
        source_items: sourceItems,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        num_options: numOptions,
        text_type: textType || null,
        exclude_source_texts: excludeSeen ? seenSourceTexts : [],
      });

      setResult(res);

      if (!seenSourceTexts.includes(res.source_text)) {
        setSeenSourceTexts((prev) => [...prev, res.source_text]);
      }
    } catch (err: any) {
      console.error(err);

      if (err?.response?.data) {
        setError(
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : JSON.stringify(err.response.data)
        );
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Request failed");
      }
    } finally {
      setLoading(false);
      setLoadingAnother(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setSeenSourceTexts([]);
    await requestFlashcard(true, false);
  }

  async function handleTryAnother() {
    if (seenSourceTexts.length >= MAX_SESSION_CARDS) {
      setError(
        "No more high-quality phrase cards are available for this input. Reset seen cards or change the phrases."
      );
      return;
    }

    await requestFlashcard(false, true);
  }

  function handleResetSeen() {
    setSeenSourceTexts([]);
    setError("");
  }

  function handleSourceLanguageChange(newSource: string) {
    setSourceLanguage(newSource);

    if (newSource === targetLanguage) {
      const fallback =
        LANGUAGE_OPTIONS.find((lang) => lang !== newSource) || "";
      setTargetLanguage(fallback);
    }

    setPhrases(
      SAMPLE_PHRASES_BY_LANGUAGE[newSource] ||
        "Enter sample phrases, one per line"
    );
    setResult(null);
    setSeenSourceTexts([]);
    setError("");
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Phrase Mode</p>
            <h1>Generate a phrase flashcard</h1>
            <p className="muted">
              Enter multiple phrases. The backend returns one flashcard using cache-first lookup.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Phrases (one per line)
            <textarea
              value={phrases}
              onChange={(e) => setPhrases(e.target.value)}
              rows={6}
              placeholder={samplePlaceholder}
            />
          </label>

          <div className="form-grid">
            <label>
              Source Language
              <select
                value={sourceLanguage}
                onChange={(e) => handleSourceLanguageChange(e.target.value)}
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
              >
                {LANGUAGE_OPTIONS.filter((lang) => lang !== sourceLanguage).map(
                  (lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Text Type
              <select
                value={textType}
                onChange={(e) => setTextType(e.target.value)}
              >
                {TEXT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type[0].toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Number of Options
              <input
                type="number"
                min={2}
                max={8}
                value={numOptions}
                onChange={(e) => setNumOptions(Number(e.target.value))}
              />
            </label>
          </div>

          {isSameLanguage && (
            <div className="error-box">
              Source and target language cannot be the same.
            </div>
          )}

          <div className="action-row">
            <button
              type="submit"
              className="primary-button"
              disabled={loading || isSameLanguage}
            >
              {loading ? "Generating..." : "Generate Flashcard"}
            </button>
          </div>
        </form>

        {seenSourceTexts.length > 0 && (
          <div className="session-meta">
            <p className="muted">Seen this session: {seenSourceTexts.length}</p>
            <button
              type="button"
              className="secondary-button"
              onClick={handleResetSeen}
            >
              Reset Seen Cards
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="panel loading-panel">
          <div className="spinner" />
          <p>Generating your flashcard...</p>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {result && (
        <FlashcardResult
          key={result.source_text}
          card={result}
          onTryAnother={handleTryAnother}
          loadingNext={loadingAnother}
          exhausted={seenSourceTexts.length >= MAX_SESSION_CARDS}
        />
      )}
    </div>
  );
}