import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const facts = JSON.parse(readFileSync(new URL("./facts.json", import.meta.url), "utf8"));
const expectedNarrative = JSON.parse(readFileSync(new URL("./narrative.json", import.meta.url), "utf8"));
const json = (res, status, payload) =>
  res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(payload));

createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/healthz") return json(res, 200, { ready: true });
  if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
    return json(res, 404, { error: "Unexpected test fixture route" });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const { messages, model } = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const userPrompt = messages.findLast((message) => message.role === "user")?.content;
    const category = /Focus on the category: ([a-z_]+)/.exec(userPrompt)?.[1];

    if (!category || !userPrompt.includes("My innie's primary skill is")) {
      return json(res, 400, { error: "Expected a wellness fact prompt" });
    }

    if (userPrompt.includes("Creative thinking") && !userPrompt.includes(expectedNarrative)) {
      return json(res, 400, { error: "Expected all five chosen traits in the model prompt" });
    }
    const invalidOutput = userPrompt.includes("Model unavailable for this test");
    const index = facts.findIndex((fact) => !userPrompt.includes(fact));
    if (index < 0) return json(res, 400, { error: "Fixture facts exhausted" });
    return json(res, 200, {
      id: `chatcmpl-oqsi-e2e-${index}`,
      object: "chat.completion",
      created: 0,
      model,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: invalidOutput ? "{}" : JSON.stringify({ fact: facts[index], category }),
        },
        finish_reason: "stop",
      }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    });
  } catch {
    return json(res, 400, { error: "Malformed test fixture request" });
  }
}).listen(38472, "127.0.0.1");
