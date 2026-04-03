import type { FlashcardResponse } from "../types/flashcard";

type Props = {
  card: FlashcardResponse;
};

export default function FlashcardResult({ card }: Props) {
  return (
    <div className="card">
      <div className="badge-row">
        <span className="badge">{card.prompt_type}</span>
        {card.text_type && <span className="badge">{card.text_type}</span>}
        {card.difficulty && <span className="badge">{card.difficulty}</span>}
        <span className="badge">
          {card.cache_hit ? "cache hit" : "fresh"}
        </span>
      </div>

      <h2>{card.source_text}</h2>
      <p className="muted">
        {card.source_language} → {card.target_language}
      </p>

      <ul>
        {card.options.map((opt) => (
          <li key={opt}>{opt}</li>
        ))}
      </ul>

      <p><strong>Answer:</strong> {card.target_text}</p>

      {card.explanation && <p>{card.explanation}</p>}
    </div>
  );
}