export { default as chatbotRouter } from "./routes";
export { isChatbotEnabled } from "./types";

export const PLUGIN_INFO = {
  name: "chatbot-asistente",
  version: "1.0.0",
  description: "Plugin Chatbot Asistente - Knowledge base search for SST Colombia",
  author: "SST Colombia",
  mountPath: "/api/plugins/chatbot",
  tables: [],
  envVars: ["ENABLE_CHATBOT"],
};
