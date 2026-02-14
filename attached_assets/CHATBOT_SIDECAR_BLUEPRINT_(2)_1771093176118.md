# Chatbot Sidecar Blueprint

Complete instructions for recreating an AI-powered chatbot sidecar in any Express + React (Vite) application. This chatbot is designed as a fully isolated module — it can be added to or removed from any app without breaking anything.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Dependencies](#2-prerequisites--dependencies)
3. [Database Schema](#3-database-schema)
4. [Backend: server/chatbot.ts](#4-backend-serverchatbotts)
5. [Frontend: ChatBot.tsx Component](#5-frontend-chatbottsx-component)
6. [Integration Points](#6-integration-points)
7. [Admin Panel: ChatbotTab](#7-admin-panel-chatbottab)
8. [Optional: Dynamic FAQ Section](#8-optional-dynamic-faq-section)
9. [Environment Variables](#9-environment-variables)
10. [Customization Guide](#10-customization-guide)
11. [Security & Performance Features](#11-security--performance-features)
12. [Testing](#12-testing)

---

## 1. Architecture Overview

The chatbot is a **sidecar** — a self-contained module that can be attached to any Express+React app. It consists of:

```
┌─────────────────────────────────────────────────┐
│  BACKEND (server/chatbot.ts)                    │
│  - OpenAI client (gpt-4o-mini)                  │
│  - System prompt (your product knowledge)       │
│  - Optional: secondary prompt (e.g., CIIU mode) │
│  - Chat endpoint (POST /api/chat)               │
│  - Status endpoint (GET /api/chatbot/status)     │
│  - Admin toggle (POST /api/admin/chatbot/toggle)│
│  - Topic classification (async, non-blocking)   │
│  - Analytics endpoints (admin-protected)        │
│  - Rate limiting per IP                         │
│  - Input sanitization                           │
│  - Trending topics endpoint                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  FRONTEND (ChatBot.tsx)                         │
│  - Floating chat bubble (bottom-right)          │
│  - Chat window with messages                    │
│  - Auto-expanding textarea input                │
│  - Suggestion buttons on empty state            │
│  - Inline action buttons from AI responses      │
│  - Markdown-lite rendering (bold, lists, links) │
│  - Status polling every 30s                     │
│  - Lazy-loaded via React.lazy()                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  ADMIN (ChatbotTab in admin panel)              │
│  - Toggle switch (enable/disable at runtime)    │
│  - Topic analytics dashboard                    │
│  - Question drill-down per topic                │
└─────────────────────────────────────────────────┘
```

**Key design principles:**
- **Gated by env var**: `ENABLE_CHATBOT=true` — when disabled, zero chatbot code runs on the server
- **Fail-safe**: If the chatbot module throws during registration, the main app continues normally
- **No hard dependencies**: The main app never imports chatbot internals. All communication is via HTTP endpoints
- **Lazy-loaded frontend**: The ChatBot component is loaded via `React.lazy()` — zero impact on initial bundle if chatbot is disabled

---

## 2. Prerequisites & Dependencies

### NPM Packages Required

**Backend:**
```
openai          # OpenAI SDK
drizzle-orm     # Database ORM (already in most apps)
```

**Frontend:**
```
framer-motion   # For chat window animations (AnimatePresence)
lucide-react    # Icons (MessageCircle, X, Send, Loader2, User)
```

### OpenAI API Access

The chatbot uses Replit's AI Integrations for OpenAI access. Install the `javascript_openai_ai_integrations` integration which provides:
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_OPENAI_API_KEY`

These are automatically managed by Replit — no manual API key needed.

### Avatar Image

Place a chatbot avatar image at `client/public/images/chatbot-avatar.png` (or change the path in ChatBot.tsx). A 64x64px round image works well.

---

## 3. Database Schema

Add this table to your `shared/schema.ts`:

```typescript
import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chatbotQuestions = pgTable("chatbot_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: varchar("topic", { length: 50 }).notNull(),
  userMessage: text("user_message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatbotQuestionSchema = createInsertSchema(chatbotQuestions).omit({
  id: true,
  createdAt: true,
});

export type InsertChatbotQuestion = z.infer<typeof insertChatbotQuestionSchema>;
export type ChatbotQuestion = typeof chatbotQuestions.$inferSelect;
```

Then run a database migration to create the table (e.g., `npx drizzle-kit push`).

---

## 4. Backend: server/chatbot.ts

Create `server/chatbot.ts` with this structure. **You MUST customize the system prompt, CIIU finder prompt (or remove it), topic categories, and action button markers for your specific product.**

```typescript
import type { Express, Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import { db } from "./db";
import { chatbotQuestions } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// ============ OPENAI CLIENT ============
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  timeout: 15_000,    // 15 second timeout
  maxRetries: 1,       // 1 automatic retry on failure
});

// ============ SYSTEM PROMPT ============
// CUSTOMIZE THIS ENTIRELY for your product.
// This is the "brain" of your chatbot — everything it knows about your product.
// Include: product features, pricing, FAQ, contact info, tone rules, formatting rules.
// Use [BOTON_XXX] markers for inline action buttons (see frontend section).
const systemPrompt = `YOUR PRODUCT SYSTEM PROMPT HERE.

Example structure:
- What your product does
- Pricing information
- Features and benefits
- FAQ answers
- Contact information
- Tone and formatting rules (e.g., formal/informal, language, allowed markdown)

FORMATTING RULES (recommended):
1. Use **bold** for key concepts
2. Use line breaks to separate ideas
3. Use bullet lists with - for comparisons
4. PROHIBIT headings (#), italics (*), numbered lists
5. Keep a conversational chat tone

ACTION BUTTON MARKERS:
When you want an action button to appear, include these markers in your response:
- [BOTON_REGISTRARSE] → "Register" button
- [BOTON_CALCULADORA] → "Go to Calculator" button
- [BOTON_XXX] → Any custom action button (define in frontend)
The frontend strips these markers and renders clickable buttons instead.`;

// ============ OPTIONAL: SECONDARY PROMPT ============
// Use this if your chatbot has a secondary mode (e.g., a specialized helper).
// Set to null if not needed, and remove ciiu_mode from the chat endpoint.
const secondaryPrompt = `YOUR OPTIONAL SECONDARY PROMPT HERE.
Or set this to null if you only need one mode.`;

// ============ TOPIC CATEGORIES ============
// CUSTOMIZE these categories for your product's domain.
// These are used for analytics — classifying what users ask about.
const TOPIC_CATEGORIES = [
  "Precios",
  "Demo",
  "Registro",
  "Documentos",
  "Funcionalidades",
  "Soporte técnico",
  "Otro",
] as const;

const TOPIC_SET = new Set<string>(TOPIC_CATEGORIES);

// ============ TOPIC CLASSIFICATION (async, non-blocking) ============
async function classifyQuestion(userMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Classify the following user question into ONE category.
Respond ONLY with the exact category name, no explanation.

Valid categories:
${TOPIC_CATEGORIES.join("\n")}

If it doesn't fit any category → "Otro"`
        },
        { role: "user", content: userMessage }
      ],
      max_tokens: 20,
      temperature: 0,
    });
    const topic = response.choices[0]?.message?.content?.trim() || "Otro";
    return TOPIC_SET.has(topic) ? topic : "Otro";
  } catch (error) {
    console.error("[Chatbot] Classification error:", error instanceof Error ? error.message : error);
    return "Otro";
  }
}

// ============ CHAT FUNCTION ============
async function chatWithAssistant(
  messages: { role: "user" | "assistant"; content: string }[],
  useSecondaryPrompt: boolean = false
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: useSecondaryPrompt && secondaryPrompt ? secondaryPrompt : systemPrompt },
      ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });
  return response.choices[0]?.message?.content || "Sorry, I couldn't process your question. Please try again.";
}

// ============ RATE LIMITING ============
const CHAT_RATE_LIMIT = 20;          // max requests per window
const CHAT_RATE_WINDOW = 60 * 1000;  // 1 minute window
const MAX_MESSAGES = 20;             // max conversation length
const MAX_MESSAGE_LENGTH = 500;      // max chars per message

const chatRateLimiter = new Map<string, { count: number; resetTime: number }>();

// Auto-clean stale entries every 5 minutes (unref'd so it doesn't block process exit)
const rateLimitCleanup = setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of chatRateLimiter) {
    if (now > data.resetTime) chatRateLimiter.delete(ip);
  }
}, 5 * 60 * 1000);
if (rateLimitCleanup.unref) rateLimitCleanup.unref();

// ============ INPUT SANITIZATION ============
function sanitizeInput(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

// ============ RUNTIME STATE ============
let chatbotEnabled = true;

// ============ ROUTE REGISTRATION ============
export function registerChatbotRoutes(
  app: Express,
  adminSessionAuth: (req: Request, res: Response, next: NextFunction) => void
) {

  // --- Public: Chatbot status ---
  app.get("/api/chatbot/status", (_req, res) => {
    return res.json({ enabled: chatbotEnabled });
  });

  // --- Admin: Toggle chatbot on/off ---
  app.post("/api/admin/chatbot/toggle", adminSessionAuth, (req, res) => {
    const { enabled } = req.body;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "Field 'enabled' (boolean) is required" });
    }
    chatbotEnabled = enabled;
    console.log(`[Chatbot] ${enabled ? "Enabled" : "Disabled"} by admin`);
    return res.json({ enabled: chatbotEnabled });
  });

  // --- Public: Chat endpoint ---
  app.post("/api/chat", async (req, res) => {
    if (!chatbotEnabled) {
      return res.status(503).json({ error: "The virtual assistant is temporarily disabled." });
    }
    try {
      const isTestMode = process.env.TEST_MODE === "true";
      const clientIP = req.ip || req.socket.remoteAddress || "unknown";

      // Rate limiting (bypassed in test mode)
      if (!isTestMode) {
        const now = Date.now();
        const rateData = chatRateLimiter.get(clientIP);
        if (rateData) {
          if (now > rateData.resetTime) {
            chatRateLimiter.set(clientIP, { count: 1, resetTime: now + CHAT_RATE_WINDOW });
          } else if (rateData.count >= CHAT_RATE_LIMIT) {
            return res.status(429).json({ error: "Too many requests. Please wait a moment." });
          } else {
            rateData.count++;
          }
        } else {
          chatRateLimiter.set(clientIP, { count: 1, resetTime: now + CHAT_RATE_WINDOW });
        }
      }

      const { messages, ciiu_mode } = req.body;
      // NOTE: Rename ciiu_mode to whatever your secondary mode is called, or remove it.

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "A messages array is required" });
      }

      if (messages.length > MAX_MESSAGES) {
        return res.status(400).json({ error: "Conversation too long. Please start a new one." });
      }

      // Validate and sanitize messages (only keep last 10)
      const validatedMessages: { role: "user" | "assistant"; content: string }[] = messages.slice(-10).map((m: any) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: typeof m.content === "string" ? sanitizeInput(m.content).slice(0, MAX_MESSAGE_LENGTH) : ""
      })).filter((m: { content: string }) => m.content.length > 0);

      if (validatedMessages.length === 0) {
        return res.status(400).json({ error: "No valid messages" });
      }

      // Async topic classification (fire-and-forget, non-blocking)
      const lastUserMessage = validatedMessages.filter(m => m.role === "user").pop();
      if (lastUserMessage && !ciiu_mode) {
        classifyQuestion(lastUserMessage.content).then(topic => {
          db.insert(chatbotQuestions).values({
            topic,
            userMessage: lastUserMessage.content.slice(0, 500),
          }).execute().catch(err => console.error("[Chatbot] Failed to store question:", err));
        });
      }

      const response = await chatWithAssistant(validatedMessages, ciiu_mode === true);
      return res.json({ response });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("[Chatbot] Chat error:", msg);
      if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
        return res.status(504).json({ error: "Response took too long. Please try again." });
      }
      return res.status(500).json({ error: "Error processing the query" });
    }
  });

  // --- Public: Trending topics (for dynamic FAQ) ---
  app.get("/api/chatbot-trending", async (_req, res) => {
    try {
      const results = await db.execute(sql`
        SELECT DISTINCT ON (cq.topic)
          cq.topic,
          count(*) OVER (PARTITION BY cq.topic) AS count,
          cq.user_message AS example
        FROM chatbot_questions cq
        ORDER BY cq.topic, cq.created_at DESC
      `);

      const rows = (results.rows || []) as { topic: string; count: string; example: string }[];
      const sorted = rows.sort((a, b) => Number(b.count) - Number(a.count)).slice(0, 2);

      return res.json({
        trending: sorted.map(r => ({
          topic: r.topic,
          count: Number(r.count),
          exampleQuestion: r.example || "",
        })),
      });
    } catch (error) {
      return res.json({ trending: [] });
    }
  });

  // --- Admin: Topic analytics summary ---
  app.get("/api/admin/chatbot-topics", adminSessionAuth, async (_req, res) => {
    try {
      const results = await db.select({
        topic: chatbotQuestions.topic,
        count: sql<number>`count(*)::int`,
        lastAsked: sql<string>`max(${chatbotQuestions.createdAt})`,
      })
        .from(chatbotQuestions)
        .groupBy(chatbotQuestions.topic)
        .orderBy(sql`count(*) desc`);

      const total = results.reduce((sum, r) => sum + r.count, 0);
      return res.json({ topics: results, total });
    } catch (error) {
      console.error("[Chatbot] Topics error:", error);
      return res.status(500).json({ error: "Error loading chatbot topics" });
    }
  });

  // --- Admin: Topic drill-down ---
  app.get("/api/admin/chatbot-topics/:topic", adminSessionAuth, async (req, res) => {
    try {
      const { topic } = req.params;
      if (!TOPIC_SET.has(topic)) {
        return res.status(400).json({ error: "Invalid topic" });
      }
      const questions = await db.select()
        .from(chatbotQuestions)
        .where(eq(chatbotQuestions.topic, topic))
        .orderBy(sql`${chatbotQuestions.createdAt} desc`)
        .limit(50);
      return res.json({ questions });
    } catch (error) {
      console.error("[Chatbot] Topic detail error:", error);
      return res.status(500).json({ error: "Error loading topic questions" });
    }
  });

  console.log("[Chatbot] Sidecar registered successfully");
}
```

---

## 5. Frontend: ChatBot.tsx Component

Create `client/src/components/ChatBot.tsx`. This is the complete floating chat widget.

**CUSTOMIZE:**
- The `markers` array in `renderMessageWithLinks` — define your own action buttons
- The `handleRegisterClick` / `handleCalculatorClick` — what each button does
- Suggestion buttons shown on empty state
- Colors (currently uses `#357947` green — replace with your brand color)
- Avatar image path
- Welcome text and labels

The full component code is in `client/src/components/ChatBot.tsx` in this project. Copy it entirely, then customize the items listed above.

**Key features of the component:**
- **Floating bubble**: Bottom-right corner, animated open/close
- **Auto-expanding textarea**: Grows up to 4 lines as user types
- **Suggestion buttons**: Shown when chat is empty, calls `sendMessage(suggestion)` directly (no race condition)
- **Action buttons**: AI responses can include `[BOTON_XXX]` markers that render as clickable buttons
- **Message rendering**: Handles bold text, URLs, bullet lists, numbered lists
- **Status polling**: Checks `/api/chatbot/status` every 30 seconds so the widget appears/disappears in real-time when admin toggles it
- **Error handling**: Different messages for 503 (disabled), 429 (rate limited), and generic errors
- **Memoized callbacks**: All handlers use `useCallback` for performance

---

## 6. Integration Points

### 6.1 Register Backend Routes (server/routes.ts)

Add the chatbot sidecar registration at the **end** of your route setup, wrapped in a try-catch so it never breaks the main app:

```typescript
import { registerChatbotRoutes } from "./chatbot";

// ... at the end of your route registration function:

// ============ CHATBOT SIDECAR (conditional) ============
if (process.env.ENABLE_CHATBOT === "true") {
  try {
    registerChatbotRoutes(app, adminSessionAuth);
  } catch (err) {
    console.error("[Chatbot] Failed to register chatbot routes — sidecar disabled:", err);
  }
}
```

The `adminSessionAuth` parameter should be your admin authentication middleware.

### 6.2 Lazy-Load Frontend Component (landing page or layout)

In your main page or layout component:

```tsx
import React, { Suspense } from "react";

const ChatBot = React.lazy(() => import("@/components/ChatBot"));

function MyPage() {
  return (
    <div>
      {/* Your page content */}

      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
}
```

The ChatBot component checks `/api/chatbot/status` on mount and renders nothing if the chatbot is disabled. So it's safe to include it always — it self-gates.

### 6.3 Optional: CIIU Mode / Secondary Mode Event

If you have a secondary chatbot mode (like our CIIU code finder), you can trigger it from anywhere with a DOM event:

```typescript
// Dispatching:
window.dispatchEvent(new Event("open-chatbot-ciiu"));

// The ChatBot component listens for this event and switches mode automatically.
```

---

## 7. Admin Panel: ChatbotTab

Add a "Chatbot" tab to your admin panel. The tab needs:

1. **Toggle switch** — calls `POST /api/admin/chatbot/toggle` with `{ enabled: boolean }`
2. **Topic analytics** — fetches `GET /api/admin/chatbot-topics` to show a list of topics with counts
3. **Question drill-down** — clicking a topic fetches `GET /api/admin/chatbot-topics/:topic` to show individual questions

Here's the toggle switch UI pattern:

```tsx
<div className="flex items-center gap-3">
  <span className={`text-sm font-medium ${enabled ? "text-emerald-700" : "text-slate-400"}`}>
    {enabled ? "Active" : "Disabled"}
  </span>
  <button
    onClick={handleToggle}
    disabled={toggling}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      enabled ? "bg-emerald-500" : "bg-slate-300"
    } ${toggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    role="switch"
    aria-checked={enabled}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
</div>
```

---

## 8. Optional: Dynamic FAQ Section

You can auto-populate FAQ sections with trending chatbot topics:

```tsx
function FAQSection() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetch("/api/chatbot-trending")
      .then(r => r.json())
      .then(data => setTrending(data.trending || []))
      .catch(() => {}); // Graceful degradation — FAQ works without chatbot
  }, []);

  return (
    <div>
      {trending.map(t => (
        <div key={t.topic}>
          <h3>{t.topic}</h3>
          <p>Example: {t.exampleQuestion}</p>
        </div>
      ))}
    </div>
  );
}
```

This endpoint is public and degrades gracefully — if the chatbot is disabled or the table is empty, it returns `{ trending: [] }`.

---

## 9. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ENABLE_CHATBOT` | Yes | Set to `"true"` to enable chatbot routes. Anything else = disabled. |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Yes | Provided by Replit AI Integrations |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Yes | Provided by Replit AI Integrations |
| `TEST_MODE` | No | When `"true"`, rate limiting is bypassed (for testing) |

---

## 10. Customization Guide

### What you MUST change:

1. **`systemPrompt`** — Replace entirely with your product's knowledge base, pricing, features, FAQ, tone rules
2. **`TOPIC_CATEGORIES`** — Replace with categories relevant to your product domain
3. **Classification prompt** — Update the rules in `classifyQuestion` to match your new categories
4. **Action button markers** — In `renderMessageWithLinks` in ChatBot.tsx, define your own `[BOTON_XXX]` markers and what they do when clicked
5. **Suggestion buttons** — Replace the 4 suggestions shown on empty chat state
6. **Colors** — Replace `#357947` (green) with your brand color throughout ChatBot.tsx
7. **Welcome text** — Update the greeting and description shown when chat opens
8. **Avatar image** — Place your own at `/images/chatbot-avatar.png`

### What you CAN change:

- **Model**: Change `gpt-4o-mini` to `gpt-4o` for better accuracy (more expensive)
- **Rate limits**: Adjust `CHAT_RATE_LIMIT` (default 20/minute) and `MAX_MESSAGE_LENGTH` (default 500 chars)
- **Max conversation length**: `MAX_MESSAGES` (default 20)
- **Context window**: `messages.slice(-10)` — how many past messages are sent to OpenAI
- **Temperature**: 0.7 for chat, 0 for classification
- **Timeout**: 15 seconds (on the OpenAI client)
- **Secondary mode**: Add or remove the CIIU/secondary prompt mode

### What you should NOT change:

- The sidecar pattern (conditional registration, try-catch, env var gating)
- The rate limiter cleanup interval with `unref()`
- The input sanitization function
- The fire-and-forget pattern for topic classification
- The status polling mechanism (30s interval)

---

## 11. Security & Performance Features

### Security
- **Input sanitization**: Control characters stripped from all user messages
- **Message length limits**: 500 chars per message, 20 messages max per conversation
- **Rate limiting**: 20 requests per minute per IP (bypassed only in TEST_MODE)
- **Topic validation**: Admin drill-down validates topic against predefined set (prevents SQL injection via params)
- **Admin-only endpoints**: Toggle and analytics endpoints require admin session authentication

### Performance
- **OpenAI client**: 15s timeout, 1 retry — prevents hanging requests
- **Topic classification**: Async/fire-and-forget — doesn't block the chat response
- **Trending query**: Single SQL query using `DISTINCT ON` + window function (no N+1)
- **Rate limit cleanup**: Auto-cleans stale entries every 5 minutes, `unref()`'d so it doesn't prevent process exit
- **O(1) topic validation**: Uses `Set` instead of `Array.includes()`
- **Frontend memoization**: All callbacks use `useCallback`, status polling runs independent of render cycle
- **Lazy loading**: ChatBot component loaded via `React.lazy()` — zero impact on initial page load

### Stability
- **Fail-safe registration**: try-catch around sidecar registration means main app never breaks
- **Graceful degradation**: Frontend checks status before rendering; trending endpoint returns empty array on error
- **504 for timeouts**: Specific error response for OpenAI timeouts vs generic 500 errors
- **Status polling**: Widget appears/disappears in real-time when admin toggles without page reload

---

## 12. Testing

### Manual Testing Checklist
1. Set `ENABLE_CHATBOT=true` and restart server — verify `[Chatbot] Sidecar registered successfully` in logs
2. Open the app — chat bubble should appear in bottom-right
3. Click bubble — chat window opens with welcome message and suggestion buttons
4. Click a suggestion — message sends immediately (no race condition)
5. Type a long message — textarea expands, send button stays round at bottom-right
6. Send a message — get AI response, check formatting (bold, links, bullets)
7. Admin panel → Chatbot tab → toggle OFF → wait 30s → widget disappears on landing page
8. Toggle ON → wait 30s → widget reappears
9. Admin panel → topic analytics show question counts
10. Click a topic → drill-down shows individual questions

### Automated Testing
Set `TEST_MODE=true` to bypass rate limiting during E2E tests. The chatbot uses the same test mode pattern as the rest of the app.

---

## File Summary

| File | Purpose | Size |
|---|---|---|
| `shared/schema.ts` | Add `chatbotQuestions` table definition | ~10 lines added |
| `server/chatbot.ts` | Complete backend sidecar (prompts, routes, analytics) | ~300 lines |
| `client/src/components/ChatBot.tsx` | Complete frontend widget | ~400 lines |
| `server/routes.ts` | Add 5-line conditional registration | ~5 lines added |
| Landing page | Add `React.lazy()` import + `<ChatBot />` | ~3 lines added |
| Admin page | Add ChatbotTab component | ~100 lines added |

Total effort: ~820 lines of self-contained, production-ready code.
