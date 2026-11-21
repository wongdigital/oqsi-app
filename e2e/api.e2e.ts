import { expect, test } from "@playwright/test";
import expectedFacts from "./facts.json";
import answers from "./answers.json";
import expectedNarrative from "./narrative.json";
import { FALLBACK_FACTS } from "../src/lib/constants";

test("API returns five validated facts from the local model", async ({ request }) => {
  const response = await request.post("/api/generate-facts", {
    data: { innie_traits: expectedNarrative, raw_selections: answers },
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ facts: expectedFacts });
});

test("API returns fallback facts when model output cannot be parsed", async ({ request }) => {
  const response = await request.post("/api/generate-facts", {
    data: { innie_traits: "My innie's primary skill is Model unavailable for this test." },
  });
  expect(response.status()).toBe(200);
  const { facts } = await response.json();
  expect(facts).toHaveLength(5);
  for (const fact of facts) expect(FALLBACK_FACTS).toContain(fact);
});
