import { useEffect, useState } from "react";
import { recordCardAnswer } from "../api/progress";
import type { FlashcardResponse } from "../types/flashcard";

type Props = {
  card: FlashcardResponse;
  onCorrect: () => void;
  onWrong: () => void;
  disabled?: boolean;
};

export default function GameCard({
  card,
  onCorrect,
  onWrong,
  disabled = false,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setSubmitted(false);
  }, [card.flashcard_id]);

  async function handleCheckAnswer() {
    if (!selectedOption || submitted || disabled) return;

    const correct = selectedOption === card.target_text;
    setSubmitted(true);

    if (card.flashcard_id) {
      try {
        await recordCardAnswer({
          flashcard_id: card.flashcard_id,
          selected_option: selectedOption,
          correct_answer: card.target_text,
          is_correct: correct,
          mode: "game",
        });
      } catch (err) {
        console.error("Failed to track game answer:", err);
      }
    } else {
      console.warn("Cannot track game answer because flashcard_id is missing.");
    }

    if (correct) {
      setTimeout(() => {
        onCorrect();
      }, 700);
    } else {
      setTimeout(() => {
        onWrong();
      }, 900);
    }
  }

  return (
    <div className="card result-card">
      <div className="badge-row">
        <span className="badge">game</span>
        {card.text_type && <span className="badge">{card.text_type}</span>}
        {card.difficulty && <span className="badge">{card.difficulty}</span>}
      </div>

      <p className="eyebrow">Translate / Interpret</p>
      <h2 className="source-text">{card.source_text}</h2>
      <p className="muted">
        {card.source_language} → {card.target_language}
      </p>

      <div className="section">
        <div className="options-grid">
          {card.options.map((option) => {
            const selected = selectedOption === option;
            const correctOption = submitted && option === card.target_text;
            const wrongOption =
              submitted && selected && option !== card.target_text;

            return (
              <button
                key={option}
                type="button"
                disabled={submitted || disabled}
                className={[
                  "option-button",
                  selected ? "option-selected" : "",
                  correctOption ? "option-correct" : "",
                  wrongOption ? "option-wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedOption(option)}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="action-row">
          <button
            type="button"
            className="primary-button"
            disabled={!selectedOption || submitted || disabled}
            onClick={handleCheckAnswer}
          >
            Check Answer
          </button>
        </div>
      </div>
    </div>
  );
}