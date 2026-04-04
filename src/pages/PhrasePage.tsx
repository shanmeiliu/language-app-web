import { useState } from "react";
import { generatePhraseFlashcard } from "../api/flashcards";
import FlashcardResult from "../components/FlashcardResult";
import ErrorMessage from "../components/ErrorMessage";
import type { FlashcardResponse } from "../types/flashcard";

export default function PhrasePage() {
  const [phrases, setPhrases] = useState("守株待兔\n杞人忧天");
  const [sourceLanguage, setSourceLanguage] = useState("Chinese");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [numOptions, setNumOptions] = useState(4);
  const [textType, setTextType] = useState("idiom");

  const [loading, setLoading] = useState(false);
  const [loadingAnother, setLoadingAnother] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FlashcardResponse | null>(null);
  const [seenSourceTexts, setSeenSourceTexts] = useState<string[]>([]);

  async function requestFlashcard(
    showInitialLoading: boolean,
    excludeSeen: boolean = true
  ) {
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
        setError(JSON.stringify(err.response.data));
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
    await requestFlashcard(false, true);
  }

  function handleResetSeen() {
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
              placeholder="守株待兔&#10;杞人忧天"
            />
          </label>

          <div className="form-grid">
            <label>
              Source Language
              <input
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
              />
            </label>

            <label>
              Target Language
              <input
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              />
            </label>

            <label>
              Text Type
              <input
                value={textType}
                onChange={(e) => setTextType(e.target.value)}
              />
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

          <div className="action-row">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Generating..." : "Generate Flashcard"}
            </button>
          </div>
        </form>

        {seenSourceTexts.length > 0 && (
          <div className="session-meta">
            <p className="muted">Seen this session: {seenSourceTexts.length}</p>
            <button type="button" className="secondary-button" onClick={handleResetSeen}>
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
        />
      )}
    </div>
  );
}