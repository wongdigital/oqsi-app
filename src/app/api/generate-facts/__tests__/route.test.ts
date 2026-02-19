import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/utils", () => ({
  generateSingleFact: vi.fn(),
  calculateSimilarity: vi.fn(),
}));

import { POST } from "../route";
import { generateSingleFact, calculateSimilarity } from "@/lib/utils";
import { FALLBACK_FACTS } from "@/lib/constants";

const mockGenerateSingleFact = generateSingleFact as Mock;
const mockCalculateSimilarity = calculateSimilarity as Mock;

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/generate-facts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate-facts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for empty innie_traits", async () => {
    const response = await POST(makeRequest({ innie_traits: "" }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for whitespace-only innie_traits", async () => {
    const response = await POST(makeRequest({ innie_traits: "   " }));
    expect(response.status).toBe(400);
  });

  it("returns 400 for missing innie_traits", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it("returns exactly 5 facts on success", async () => {
    let callCount = 0;
    mockGenerateSingleFact.mockImplementation(async () => {
      callCount++;
      return {
        fact: `Your Outie fact number ${callCount}`,
        category: "moral_virtues",
      };
    });
    mockCalculateSimilarity.mockReturnValue(0.0);

    const response = await POST(
      makeRequest({ innie_traits: "Detail-oriented, quiet" })
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.facts).toHaveLength(5);
  });

  it("returns response when all AI calls return fallback category (Bug 1 prevention)", async () => {
    mockGenerateSingleFact.mockResolvedValue({
      fact: FALLBACK_FACTS[0],
      category: "fallback",
    });
    mockCalculateSimilarity.mockReturnValue(0.0);

    const response = await POST(
      makeRequest({ innie_traits: "Detail-oriented" })
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.facts).toBeDefined();
    expect(data.facts.length).toBeGreaterThanOrEqual(1);
  });

  it("completes within 10s even when all AI calls are slow (Bug 2 prevention)", async () => {
    mockGenerateSingleFact.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { fact: "Your Outie is always the same", category: "fallback" };
    });
    // Always too similar → forces max retries per category
    mockCalculateSimilarity.mockReturnValue(0.5);

    const start = Date.now();
    const response = await POST(
      makeRequest({ innie_traits: "Detail-oriented" })
    );
    const elapsed = Date.now() - start;

    expect(response.status).toBe(200);
    expect(elapsed).toBeLessThan(10000);
  });

  it("calls generateSingleFact at most 15 times (Bug 2 bounded retry)", async () => {
    mockGenerateSingleFact.mockResolvedValue({
      fact: "Your Outie always returns the same fact",
      category: "moral_virtues",
    });
    // Always too similar → forces max retries
    mockCalculateSimilarity.mockReturnValue(0.5);

    await POST(makeRequest({ innie_traits: "Detail-oriented" }));

    // 5 categories × 3 max attempts = 15 max calls
    expect(mockGenerateSingleFact.mock.calls.length).toBeLessThanOrEqual(15);
  });

  it("retries when similarity is high", async () => {
    let callCount = 0;
    mockGenerateSingleFact.mockImplementation(async () => {
      callCount++;
      return {
        fact: `Your Outie unique fact ${callCount}`,
        category: "moral_virtues",
      };
    });
    // First two similarity checks return high → forces retries for category 2
    // All subsequent checks return low → remaining categories pass immediately
    mockCalculateSimilarity
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValue(0.0);

    const response = await POST(
      makeRequest({ innie_traits: "Detail-oriented" })
    );
    expect(response.status).toBe(200);
    // More than 5 calls means retries happened
    expect(callCount).toBeGreaterThan(5);
  });

  it("fills remaining slots with fallback facts when AI generates too few unique", async () => {
    mockGenerateSingleFact.mockResolvedValue({
      fact: "Your Outie always same fact",
      category: "moral_virtues",
    });
    // Always too similar → only first category succeeds, rest get fallbacks
    mockCalculateSimilarity.mockReturnValue(0.5);

    const response = await POST(
      makeRequest({ innie_traits: "Detail-oriented" })
    );
    const data = await response.json();

    expect(data.facts).toHaveLength(5);
    // Some facts should be from the fallback list
    const fallbackCount = data.facts.filter((f: string) =>
      FALLBACK_FACTS.includes(f)
    ).length;
    expect(fallbackCount).toBeGreaterThan(0);
  });
});
