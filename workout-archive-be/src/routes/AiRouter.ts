import { Router } from "express";
import { createAIEngine } from "@aiglue/core";
import type { Request } from "express";
import path from "path";

const aiRouter = Router();
const engine = createAIEngine({
  tools: path.resolve(__dirname, "../../tools.yaml"),
  llm: {
    provider: "openai-compatible",
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    baseUrl: "https://api.groq.com/openai/v1",
  },
  baseUrl: `http://localhost:${process.env.PORT ?? 3000}`,
  auth: {
    type: "bearer",
    token: (req) => (req as Request).cookies?.auth_token,
  },
});

aiRouter.post("/chat", engine.handler());

export default aiRouter;
