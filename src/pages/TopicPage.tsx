import { useState } from "react";
import CreatableSelect from "react-select/creatable";
import { generateTopicFlashcard } from "../api/flashcards";
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

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const TEXT_TYPE_OPTIONS = [
  { value: "phrase", label: "Phrase" },
  { value: "idiom", label: "Idiom" },
  { value: "proverb", label: "Proverb" },
  { value: "sentence", label: "Sentence" },
];

const TOPIC_OPTIONS = [
  { value: "daily conversation", label: "Daily Conversation" },
  { value: "travel", label: "Travel" },
  { value: "business", label: "Business" },
  { value: "food", label: "Food" },
  { value: "shopping", label: "Shopping" },
  { value: "family", label: "Family" },
  { value: "workplace", label: "Workplace" },
  { value: "classical literature", label: "Classical Literature" },
  { value: "idioms", label: "Idioms" },
  { value: "proverbs", label: "Proverbs" },
];

const MAX_SESSION_CARDS = 8;

export default function TopicPage() {
  const [topic, setTopic] = useState("classical literature");
  const [difficulty, setDifficulty] = useState("advanced");
  const [sourceLanguage, setSourceLanguage] = useState("Chinese");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [numOptions, setNumOptions] = useState(4);
  const [textType, setTextType] = useState("phrase");

  const [loading, setLoading] = useState(false);
  const [loadingAnother, setLoadingAnother] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FlashcardResponse | null>(null);
  const [seenSourceTexts, setSeenSourceTexts] = useState<string[]>([]);

  const isSameLanguage = sourceLanguage === targetLanguage;

  async function requestFlashcard(
    showInitialLoading: boolean,
    excludeSeen: boolean = true
  ) {
    if (isSameLanguage) {
      setError("Source and target language cannot be the same.");
      return;
    }

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    if (showInitialLoading) {
      setLoading(true);
    } else {
      setLoadingAnother(true);
    }

    setError("");

    try {
      const res = await generateTopicFlashcard({
        topic: topic.trim(),
        difficulty,
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
        "No more high-quality topic cards are available right now. Reset seen cards or change the topic or difficulty."
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
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Topic Mode</p>
            <h1>Generate a topic flashcard</h1>
            <p className="muted">
              Enter a topic and difficulty to generate one flashcard with cache-first lookup.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <label>
              Topic
              <CreatableSelect
                options={TOPIC_OPTIONS}
                value={topic ? { value: topic, label: topic } : null}
                onChange={(option) => setTopic(option?.value || "")}
                onCreateOption={(inputValue) => setTopic(inputValue)}
                placeholder="Search or type a topic..."
                isClearable
                formatCreateLabel={(inputValue) => `Use custom topic: "${inputValue}"`}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: 48,
                    borderRadius: 14,
                    borderColor: "#cbd5e1",
                    boxShadow: "none",
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: 14,
                    overflow: "hidden",
                    zIndex: 20,
                  }),
                }}
              />
            </label>

            <label>
              Difficulty
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFICULTY_OPTIONS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </label>

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
                  <option key={type.value} value={type.value}>
                    {type.label}
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
              disabled={loading || isSameLanguage || !topic.trim()}
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