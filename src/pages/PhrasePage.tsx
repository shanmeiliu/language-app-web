import { useState } from "react";
import { generatePhraseFlashcard } from "../api/flashcards";
import FlashcardResult from "../components/FlashcardResult";
import ErrorMessage from "../components/ErrorMessage";

export default function PhrasePage() {
  const [input, setInput] = useState("守株待兔\n杞人忧天");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const items = input.split("\n").map((x) => x.trim()).filter(Boolean);

      const res = await generatePhraseFlashcard({
        source_items: items,
        source_language: "Chinese",
        target_language: "English",
        num_options: 4,
        text_type: "idiom",
      });

      setResult(res);
    } catch (err: any) {
  console.error(err);

  if (err?.response?.data) {
    setError(JSON.stringify(err.response.data));
  } else if (err?.message) {
    setError(err.message);
  } else {
    setError("Request failed");
  }
}finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Phrase</h1>
      <form onSubmit={handleSubmit}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">{loading ? "Loading..." : "Generate"}</button>
      </form>

      {error && <ErrorMessage message={error} />}
      {result && <FlashcardResult card={result} />}
    </div>
  );
}