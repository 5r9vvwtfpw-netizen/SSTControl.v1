import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { db } from "./db";
import { chatbotQuestions } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `Eres el asistente virtual de SST Colombia, un sistema de gestión de Seguridad y Salud en el Trabajo.

Tu rol es ayudar a usuarios del sistema con:
- Navegación y uso de la plataforma SST Colombia
- Preguntas sobre normativa colombiana de SST (Resolución 0312/2019, Decreto 1072/2015, ISO 45001:2018)
- Guía sobre el ciclo PHVA (Planear, Hacer, Verificar, Actuar)
- Preguntas sobre el Plan Estratégico de Seguridad Vial (PESV) según Resolución 40595/2022
- Gestión de trabajadores, capacitaciones, inspecciones, accidentes laborales
- Estándares mínimos y evaluaciones de cumplimiento
- Indicadores de accidentalidad y salud ocupacional
- Comité Paritario de Seguridad y Salud en el Trabajo (COPASST)
- Comité de Convivencia Laboral

Reglas importantes:
1. Responde SIEMPRE en español colombiano, de manera profesional y clara.
2. Sé conciso pero completo. Usa listas cuando sea apropiado.
3. Si no sabes algo específico sobre la plataforma, indica que el usuario puede contactar soporte.
4. Cuando cites normativa, menciona el artículo o resolución específica.
5. No inventes funcionalidades que no existen en el sistema.
6. Mantén un tono amigable y profesional.
7. Para preguntas técnicas del sistema, guía al usuario paso a paso.
8. Si la pregunta no está relacionada con SST o la plataforma, redirige amablemente al tema.

El sistema SST Colombia tiene los siguientes módulos principales:
- Dashboard: Vista general con métricas y alertas
- Trabajadores: Gestión de empleados, contratos, afiliaciones
- Capacitaciones: Programación y seguimiento de capacitaciones SST
- Inspecciones: Registro y seguimiento de inspecciones de seguridad
- Accidentes: Reporte y seguimiento de accidentes laborales (FURAT)
- Salud Ocupacional: Gestión de exámenes médicos y vigilancia epidemiológica
- Estándares SST: Evaluación de cumplimiento Resolución 0312/2019
- PESV: Plan Estratégico de Seguridad Vial
- Informes: Generación de reportes y estadísticas
- Medidas Preventivas: Gestión de acciones preventivas y correctivas`;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export function registerChatbotRoutes(app: Express): void {
  app.post("/api/chatbot/ask", async (req: Request, res: Response) => {
    try {
      const { question, conversationHistory } = req.body;
      if (!question || typeof question !== "string" || question.trim().length === 0) {
        return res.status(400).json({ error: "La pregunta es requerida" });
      }
      if (question.length > 2000) {
        return res.status(400).json({ error: "La pregunta es demasiado larga (máximo 2000 caracteres)" });
      }

      const user = (req as any).user;
      const userId = user?.id || "anonymous";
      const companyId = user?.companyId || null;

      if (!checkRateLimit(userId)) {
        return res.status(429).json({ error: "Has alcanzado el límite de preguntas por hora. Intenta más tarde." });
      }

      const startTime = Date.now();

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      if (Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-6);
        for (const msg of recentHistory) {
          if (msg.role === "user" || msg.role === "assistant") {
            messages.push({ role: msg.role, content: msg.content });
          }
        }
      }

      messages.push({ role: "user", content: question.trim() });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      });

      let fullResponse = "";
      let tokensUsed = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
        if (chunk.usage) {
          tokensUsed = chunk.usage.total_tokens;
        }
      }

      const responseTimeMs = Date.now() - startTime;

      try {
        await db.insert(chatbotQuestions).values({
          companyId,
          userId: user?.id || null,
          question: question.trim(),
          answer: fullResponse,
          tokensUsed: tokensUsed || null,
          responseTimeMs,
        });
      } catch (logErr) {
        console.error("Error logging chatbot question:", logErr);
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Chatbot error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Error al procesar tu pregunta. Intenta de nuevo." })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Error al procesar tu pregunta. Intenta de nuevo." });
      }
    }
  });
}
