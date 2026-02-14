export interface KnowledgeItem {
  keywords: string[];
  question: string;
  answer: string;
  category: string;
  followUp?: string[];
  images?: string[];
}

export interface ChatSearchResult {
  question: string;
  answer: string;
  category: string;
  followUp?: string[];
  images?: string[];
  relatedQuestions: string[];
}

export interface ChatSearchResponse {
  success: boolean;
  result: ChatSearchResult | null;
  query: string;
}

export function isChatbotEnabled(): boolean {
  const flag = process.env.ENABLE_CHATBOT;
  if (flag === undefined || flag === null) return true;
  return flag === "true";
}
