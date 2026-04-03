import axios from "axios";
import type {
  FlashcardResponse,
  PhraseFlashcardRequest,
  TopicFlashcardRequest,
} from "../types/flashcard";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export async function generatePhraseFlashcard(
  payload: PhraseFlashcardRequest
): Promise<FlashcardResponse> {
  const res = await api.post("/api/flashcards/phrase", payload);
  return res.data;
}

export async function generateTopicFlashcard(
  payload: TopicFlashcardRequest
): Promise<FlashcardResponse> {
  const res = await api.post("/api/flashcards/topic", payload);
  return res.data;
}