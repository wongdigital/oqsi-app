import { describe, it, expect } from "vitest";
import {
  generateRandomSeed,
  extractKeyThemes,
  calculateSimilarity,
} from "../utils";

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
