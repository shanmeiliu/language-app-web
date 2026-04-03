export type FlashcardResponse = {
  source_language: string;
  target_language: string;
  prompt_type: string;
  text_type: string | null;
  difficulty: string | null;
  topic: string | null;
  source_text: string;
  target_text: string;
  explanation: string | null;
  options: string[];
  cache_hit: boolean;
};

export type PhraseFlashcardRequest = {
  source_items: string[];
  source_language: string;
  target_language: string;
  num_options: number;
  text_type?: string | null;
};

export type TopicFlashcardRequest = {
  topic: string;
  difficulty: string;
  source_language: string;
  target_language: string;
  num_options: number;
  text_type?: string | null;
};