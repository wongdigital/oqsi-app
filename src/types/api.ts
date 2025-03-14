export interface InnieRequest {
  innie_traits: string;
  raw_selections?: Record<string, string>;
}

export interface WellnessFact {
  fact: string;
  category: string;
}

export interface WellnessFactResponse {
  facts: string[];
}

export type FactCategory =
  | "moral_virtues"
  | "social_interactions"
  | "practical_skills"
  | "aesthetic_appreciation"
  | "physical_abilities"
  | "cultural_knowledge"
  | "quirky_habits"
  | "social_standing"
  | "emotional_traits"
  | "etiquette_behaviors"
  | "unusual_talents"
  | "possessions"
  | "animal_relations"
  | "achievements"
  | "future_predictions"; 