import { expect, test } from "@playwright/test";
import { open } from "node:fs/promises";
import questionnaire from "../src/content.json";
import expectedFacts from "./facts.json";
import answers from "./answers.json";
import expectedNarrative from "./narrative.json";

test("completes the questionnaire, shows validated facts and downloads them", async ({ page, baseURL }) => {
  // No live analytics, CDN audio, or other third-party browser requests.
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === baseURL ? route.continue() : route.abort(),
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(page).toHaveURL("/observing");
  await page.getByRole("button", { name: "Begin" }).click();

  await page.locator("#first-name").fill("Casey");
  await page.locator("#last-name").fill("Miller");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  const responsePromise = page.waitForResponse((response) =>
    new URL(response.url()).pathname === "/api/generate-facts" &&
    response.request().method() === "POST",
  );

  for (const slide of questionnaire.content.slides.filter((slide) => slide.type === "multipleChoice")) {
    await expect(page.getByRole("heading", { name: slide.title, exact: true })).toBeVisible();
    const answer = answers[slide.selectionKey as keyof typeof answers];
    const optionNumber = slide.options.indexOf(answer) + 1;
    expect(optionNumber).toBeGreaterThan(1); // none of the defaults can accidentally satisfy the test
    await page.getByRole("button", { name: `${optionNumber} ${answer}`, exact: true }).click();
  }

  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  expect(response.request().postDataJSON()).toEqual({
    innie_traits: expectedNarrative,
    raw_selections: answers,
  });
  // Exact fixture facts guard against a green test if the API silently serves fallbacks.
  expect((await response.json()).facts).toEqual(expectedFacts);
  await expect(page).toHaveURL("/splendid");
  await expect(page.getByRole("heading", { name: "Wellness Facts for Casey M." })).toBeVisible();
  for (const fact of expectedFacts) {
    await expect(page.getByText(fact, { exact: true })).toHaveCSS("opacity", "1", { timeout: 20_000 });
  }

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Outie Facts" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("wellness-facts.png");
  expect(await download.failure()).toBeNull();
  const file = await open(await download.path(), "r");
  try {
    const header = Buffer.alloc(8);
    const { bytesRead } = await file.read(header);
    expect(bytesRead).toBe(8);
    expect(header.toString("hex")).toBe("89504e470d0a1a0a");
  } finally {
    await file.close();
  }
});

test("direct results navigation without answers returns home without requesting facts", async ({ page }) => {
  const factRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/generate-facts") factRequests.push(request.method());
  });
  await page.goto("/splendid");
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
  expect(factRequests).toEqual([]);
});
