import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  generateRandomSeed,
  extractKeyThemes,
  calculateSimilarity,
} from "../utils";
import { FACT_CATEGORIES, FALLBACK_FACTS } from "../constants";

describe("generateRandomSeed", () => {
  it("returns an integer", () => {
    const seed = generateRandomSeed();
    expect(Number.isInteger(seed)).toBe(true);
  });

  it("returns value in range 1–1,000,000", () => {
    for (let i = 0; i < 100; i++) {
      const seed = generateRandomSeed();
      expect(seed).toBeGreaterThanOrEqual(1);
      expect(seed).toBeLessThanOrEqual(1000000);
    }
  });
});

describe("extractKeyThemes", () => {
  it("extracts words with 4+ characters", () => {
    const themes = extractKeyThemes("Your Outie is kind and nice");
    expect(themes.has("kind")).toBe(true);
    expect(themes.has("nice")).toBe(true);
    // "is" and "and" have < 4 chars, should be excluded
    expect(themes.has("is")).toBe(false);
    expect(themes.has("and")).toBe(false);
  });

  it("lowercases all words", () => {
    const themes = extractKeyThemes("Your Outie Loves COOKING");
    expect(themes.has("loves")).toBe(true);
    expect(themes.has("cooking")).toBe(true);
    expect(themes.has("Loves")).toBe(false);
    expect(themes.has("COOKING")).toBe(false);
  });

  it("returns a Set", () => {
    const themes = extractKeyThemes("Your Outie is kind");
    expect(themes).toBeInstanceOf(Set);
  });

  it("handles empty input", () => {
    const themes = extractKeyThemes("");
    expect(themes.size).toBe(0);
  });

  it("handles input with no 4+ char words", () => {
    const themes = extractKeyThemes("is a to");
    expect(themes.size).toBe(0);
  });
});

describe("calculateSimilarity", () => {
  it("returns 1.0 for identical facts", () => {
    const fact = "Your Outie enjoys collecting vintage records";
    expect(calculateSimilarity(fact, fact)).toBe(1.0);
  });

  it("returns 0.0 for facts with no overlapping keywords", () => {
    // Ensure no 4+ char words overlap between the two
    const fact1 = "cats jump high wall";
    const fact2 = "dogs swim deep lake";
    expect(calculateSimilarity(fact1, fact2)).toBe(0.0);
  });

  it("returns 0.0 when either fact has no keywords", () => {
    expect(calculateSimilarity("", "Your Outie is kind")).toBe(0.0);
    expect(calculateSimilarity("Your Outie is kind", "")).toBe(0.0);
    expect(calculateSimilarity("", "")).toBe(0.0);
  });

  it("calculates correct Jaccard similarity for partial overlap", () => {
    // "your outie loves cooking" → {your, outie, loves, cooking}
    // "your outie loves dancing" → {your, outie, loves, dancing}
    // intersection = {your, outie, loves} = 3
    // union = {your, outie, loves, cooking, dancing} = 5
    // similarity = 3/5 = 0.6
    const sim = calculateSimilarity(
      "Your Outie loves cooking",
      "Your Outie loves dancing"
    );
    expect(sim).toBeCloseTo(0.6, 5);
  });
});

// Mirrors the Zod schema defined in utils.ts for the structured output parser.
// If a Zod upgrade breaks .startsWith() or .enum(), this test catches it
// without needing an API key.
const factSchema = z.object({
  fact: z.string().startsWith("Your Outie"),
  category: z.enum([
    "moral_virtues",
    "social_interactions",
    "practical_skills",
    "aesthetic_appreciation",
    "physical_abilities",
    "cultural_knowledge",
    "quirky_habits",
    "social_standing",
    "emotional_traits",
    "etiquette_behaviors",
    "unusual_talents",
    "possessions",
    "animal_relations",
    "achievements",
    "future_predictions",
  ]),
});

describe("fact Zod schema", () => {
  it("accepts a valid fact", () => {
    const result = factSchema.safeParse({
      fact: "Your Outie can parallel park in less than 20 seconds.",
      category: "practical_skills",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a fact not starting with 'Your Outie'", () => {
    const result = factSchema.safeParse({
      fact: "The Outie enjoys long walks.",
      category: "quirky_habits",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid category", () => {
    const result = factSchema.safeParse({
      fact: "Your Outie is kind.",
      category: "invalid_category",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(factSchema.safeParse({ fact: "Your Outie is kind." }).success).toBe(
      false
    );
    expect(
      factSchema.safeParse({ category: "moral_virtues" }).success
    ).toBe(false);
    expect(factSchema.safeParse({}).success).toBe(false);
  });

  it("accepts every FACT_CATEGORIES value", () => {
    for (const category of FACT_CATEGORIES) {
      const result = factSchema.safeParse({
        fact: "Your Outie is splendid.",
        category,
      });
      expect(result.success, `category "${category}" should be valid`).toBe(
        true
      );
    }
  });
});

describe("constants integrity", () => {
  it("FACT_CATEGORIES has 15 entries", () => {
    expect(FACT_CATEGORIES).toHaveLength(15);
  });

  it("FACT_CATEGORIES contains no duplicates", () => {
    expect(new Set(FACT_CATEGORIES).size).toBe(FACT_CATEGORIES.length);
  });

  it("FALLBACK_FACTS has 16 entries", () => {
    expect(FALLBACK_FACTS).toHaveLength(16);
  });

  it('every FALLBACK_FACTS entry starts with "Your Outie"', () => {
    for (const fact of FALLBACK_FACTS) {
      expect(fact, `"${fact}" should start with "Your Outie"`).toMatch(
        /^Your Outie/
      );
    }
  });

  it("FALLBACK_FACTS contains no duplicates", () => {
    expect(new Set(FALLBACK_FACTS).size).toBe(FALLBACK_FACTS.length);
  });
});
