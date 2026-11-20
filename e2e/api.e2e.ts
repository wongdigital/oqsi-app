import { expect, test } from "@playwright/test";
import expectedFacts from "./facts.json";

test("API returns five validated facts from the local model", async ({ request }) => {
  const response = await request.post("/api/generate-facts", {
    data: { innie_traits: "My innie's primary skill is Data analysis." },
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ facts: expectedFacts });
});
