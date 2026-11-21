import { defineConfig } from "@playwright/test";

const appURL = "http://127.0.0.1:38473";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 60_000,
  workers: 1,
  use: {
    baseURL: appURL,
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.OQSI_E2E_CHROMIUM_PATH || undefined,
    },
  },
  webServer: [
    {
      command: "node e2e/model-server.mjs",
      url: "http://127.0.0.1:38472/healthz",
      reuseExistingServer: false,
    },
    {
      command: "pnpm start --hostname 127.0.0.1 --port 38473",
      url: appURL,
      reuseExistingServer: false,
      env: {
        OPENAI_API_KEY: "oqsi-test-placeholder",
        OPENAI_API_BASE: "http://127.0.0.1:38472/v1",
        OPENAI_BASE_URL: "http://127.0.0.1:38472/v1",
        OPENAI_MODEL: "gpt-4.1-mini",
        BUNNY_API_KEY: "",
        BUNNY_LIBRARY_ID: "",
        BUNNY_PULL_ZONE: "",
        NEXT_TELEMETRY_DISABLED: "1",
        LANGSMITH_TRACING: "false",
        LANGCHAIN_TRACING_V2: "false",
      },
    },
  ],
});
