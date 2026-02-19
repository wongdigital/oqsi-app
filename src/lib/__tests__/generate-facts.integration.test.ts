import { describe, it, expect } from "vitest";
import { generateSingleFact } from "../utils";
import { FALLBACK_FACTS } from "../constants";

const hasApiKey = !!process.env.OPENAI_API_KEY;

describe.skipIf(!hasApiKey)(
  "generateSingleFact integration (real OpenAI)",
  () => {
    it(
      "generates a fact that is NOT a fallback (Bug 1 prevention)",
      async () => {
        const result = await generateSingleFact(
          "Detail-oriented, quiet, follows rules",
          "quirky_habits",
          []
        );
        expect(result.category).not.toBe("fallback");
        expect(FALLBACK_FACTS).not.toContain(result.fact);
      },
      15000
    );

    it(
      'generates a fact starting with "Your Outie" (structured output works)',
      async () => {
        const result = await generateSingleFact(
          "Detail-oriented, quiet, follows rules",
          "moral_virtues",
          []
        );
        expect(result.fact).toMatch(/^Your Outie/);
      },
      15000
    );

    it(
      "single fact generation completes within 15s (Bug 2 prevention)",
      async () => {
        const start = Date.now();
        await generateSingleFact("Creative, energetic", "unusual_talents", []);
        expect(Date.now() - start).toBeLessThan(15000);
      },
      15000
    );

    it(
      "full 5-fact pipeline completes within 60s (Bug 2 prevention)",
      async () => {
        const { POST } = await import(
          "../../app/api/generate-facts/route"
        );
        const request = new Request("http://localhost/api/generate-facts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            innie_traits: "Detail-oriented, quiet, follows rules",
          }),
        });

        const start = Date.now();
        const response = await POST(request);
        const elapsed = Date.now() - start;

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.facts).toHaveLength(5);
        expect(elapsed).toBeLessThan(60000);
      },
      60000
    );
  }
);
