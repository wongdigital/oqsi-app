import { expect, test } from "@playwright/test";
import { open } from "node:fs/promises";
import questionnaire from "../src/content.json";
import expectedFacts from "./facts.json";

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
    await page.getByRole("button", { name: `1 ${slide.options[0]}`, exact: true }).click();
  }

  const response = await responsePromise;
  expect(response.ok()).toBe(true);
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
