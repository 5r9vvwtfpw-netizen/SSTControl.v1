import { Router, Request, Response } from "express";
import { isChatbotEnabled } from "./types";
import { knowledgeBase, quickQuestions, findBestMatch, getRelatedQuestions, getDefaultResponse } from "./knowledge-base";

const router = Router();

router.get("/search", (req: Request, res: Response) => {
  if (!isChatbotEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  const query = req.query.q as string;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ success: false, error: "Query parameter 'q' is required" });
  }

  const match = findBestMatch(query.trim());

  if (match) {
    const relatedQuestions = getRelatedQuestions(match.category);
    return res.json({
      success: true,
      query: query.trim(),
      result: {
        question: match.question,
        answer: match.answer,
        category: match.category,
        followUp: match.followUp || [],
        images: match.images || [],
        relatedQuestions,
      },
    });
  }

  return res.json({
    success: true,
    query: query.trim(),
    result: null,
    defaultResponse: getDefaultResponse(),
  });
});

router.get("/categories", (_req: Request, res: Response) => {
  if (!isChatbotEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  const categories = Array.from(new Set(knowledgeBase.map(item => item.category)));
  return res.json({ success: true, categories });
});

router.get("/suggestions", (_req: Request, res: Response) => {
  if (!isChatbotEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json({ success: true, suggestions: quickQuestions });
});

export default router;
