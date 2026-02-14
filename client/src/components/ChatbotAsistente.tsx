export interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
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

interface ChatSearchResponse {
  success: boolean;
  result: ChatSearchResult | null;
  query: string;
  defaultResponse?: string;
}

interface ChatSuggestion {
  text: string;
  category: string;
}

interface ChatSuggestionsResponse {
  success: boolean;
  suggestions: ChatSuggestion[];
}

export async function searchChatbot(query: string): Promise<ChatSearchResponse> {
  const res = await fetch(`/api/plugins/chatbot/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    return { success: false, result: null, query };
  }
  return res.json();
}

export async function getChatbotSuggestions(): Promise<ChatSuggestion[]> {
  const res = await fetch("/api/plugins/chatbot/suggestions");
  if (!res.ok) {
    return [];
  }
  const data: ChatSuggestionsResponse = await res.json();
  return data.suggestions || [];
}
