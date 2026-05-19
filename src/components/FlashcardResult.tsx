import { useEffect, useMemo, useState } from "react";
import { recordCardAnswer, recordCardShown } from "../api/progress";
import type { FlashcardResponse } from "../types/flashcard";

type Props = {
  card: FlashcardResponse;
  onTryAnother?: () => void;
  loadingNext?: boolean;
  exhausted?: boolean;
};

export default function FlashcardResult({
  card,
  onTryAnother,
  loadingNext = false,
  exhausted = false,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const isCorrect = useMemo(() => {
    if (!selectedOption) return false;
    return selectedOption === card.target_text;
  }, [selectedOption, card.target_text]);

  useEffect(() => {
    let cancelled = false;

    setSelectedOption(null);
    setSubmitted(false);
    setAttemptId(null);

    async function trackShown() {
      if (!card.flashcard_id) {
        console.warn("Cannot track shown card because flashcard_id is missing.");
        return;
      }

      try {
        const res = await recordCardShown({
          flashcard_id: card.flashcard_id,
          mode: card.prompt_type,
        });

        if (!cancelled) {
          setAttemptId(res.attempt_id);
        }
      } catch (err) {
        console.error("Failed to track shown card:", err);
      }
    }

    trackShown();

    return () => {
      cancelled = true;
    };
  }, [card.flashcard_id, card.prompt_type]);

  async function handleSubmitAnswer() {
    if (!selectedOption || submitted) return;

    setSubmitted(true);

    if (attemptId) {
      try {
        await recordCardAnswer({
          attempt_id: attemptId,
          selected_option: selectedOption,
          correct_answer: card.target_text,
          is_correct: selectedOption === card.target_text,
        });
      } catch (err) {
        console.error("Failed to track answer:", err);
      }
    }
  }

  function handleResetAnswer() {
    setSelectedOption(null);
    setSubmitted(false);
  }

  return (
    <div className="card result-card">
      <div className="badge-row">
        <span className="badge">{card.prompt_type}</span>
        {card.text_type && <span className="badge">{card.text_type}</span>}
        {card.difficulty && <span className="badge">{card.difficulty}</span>}
        <span
          className={`badge ${card.cache_hit ? "badge-cache" : "badge-fresh"}`}
        >
          {card.cache_hit ? "cache hit" : "fresh"}
        </span>
      </div>

      <div className="result-header">
        <div>
          <p className="eyebrow">Source Text</p>
          <h2 className="source-text">{card.source_text}</h2>
          <p className="muted">
            {card.source_language} → {card.target_language}
          </p>
        </div>
      </div>

      <div className="section">
        <h3>Choose the best answer</h3>
        <div className="options-grid">
          {card.options.map((option) => {
            const selected = selectedOption === option;
            const correct = submitted && option === card.target_text;
            const wrong = submitted && selected && option !== card.target_text;

            return (
              <button
                key={option}
                type="button"
                className={[
                  "option-button",
                  selected ? "option-selected" : "",
                  correct ? "option-correct" : "",
                  wrong ? "option-wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (submitted) return;
                  setSelectedOption(option);
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="action-row">
          {!submitted ? (
            <button
              type="button"
              className="primary-button"
              onClick={handleSubmitAnswer}
              disabled={!selectedOption}
            >
              Check Answer
            </button>
          ) : (
            <>
              <button
                type="button"
                className="secondary-button"
                onClick={handleResetAnswer}
              >
                Try Again
              </button>

              {onTryAnother && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={onTryAnother}
                  disabled={loadingNext || exhausted}
                >
                  {exhausted
                    ? "No More Strong Cards"
                    : loadingNext
                      ? "Loading..."
                      : "Try Another"}
                </button>
              )}
            </>
          )}
        </div>

        {submitted && (
          <div
            className={`answer-feedback ${
              isCorrect ? "feedback-correct" : "feedback-wrong"
            }`}
          >
            {isCorrect ? "Correct!" : "Not quite."}
          </div>
        )}
      </div>

      {submitted && (
        <>
          <div className="section">
            <h3>Correct Answer</h3>
            <p className="answer-text">{card.target_text}</p>
          </div>

          {card.explanation && (
            <div className="section">
              <h3>Explanation</h3>
              <p>{card.explanation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}