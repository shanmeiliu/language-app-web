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
  const res = await api.post<FlashcardResponse>("/api/flashcards/phrase", payload);
  return res.data;
}

export async function generateTopicFlashcard(
  payload: TopicFlashcardRequest
): Promise<FlashcardResponse> {
  const res = await api.post<FlashcardResponse>("/api/flashcards/topic", payload);
  return res.data;
}

export async function getNextGameQuestion(
  payload: TopicFlashcardRequest & {
    exclude_source_texts?: string[];
    batch_size?: number;
  }
): Promise<FlashcardResponse> {
  const res = await api.post<FlashcardResponse>("/api/game/next-question", payload);
  return res.data;
}