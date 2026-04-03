import { useMemo, useState } from "react";
import type { FlashcardResponse } from "../types/flashcard";

type Props = {
  card: FlashcardResponse;
};

export default function FlashcardResult({ card }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = useMemo(() => {
    if (!selectedOption) return false;
    return selectedOption === card.target_text;
  }, [selectedOption, card.target_text]);

  function handleSubmitAnswer() {
    if (!selectedOption) return;
    setSubmitted(true);
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
        <span className={`badge ${card.cache_hit ? "badge-cache" : "badge-fresh"}`}>
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
            <button
              type="button"
              className="secondary-button"
              onClick={handleResetAnswer}
            >
              Try Again
            </button>
          )}
        </div>

        {submitted && (
          <div className={`answer-feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}`}>
            {isCorrect ? "Correct!" : "Not quite."}
          </div>
        )}
      </div>

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
    </div>
  );
}