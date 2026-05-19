import { apiFetch } from "../lib/api";

export async function recordCardShown(payload: {
  flashcard_id: string;
  mode?: string;
}) {
  const res = await apiFetch("/api/progress/shown", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to record shown card");
  }

  return await res.json();
}

export async function recordCardAnswer(payload: {
  attempt_id: string;
  selected_option: string;
  correct_answer: string;
  is_correct: boolean;
}) {
  const res = await apiFetch("/api/progress/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to record answer");
  }

  return await res.json();
}

export async function getDashboardAttempts() {
  const res = await apiFetch("/api/progress/dashboard");

  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }

  return await res.json();
}