---
name: Chatbot knowledge base must mirror real form fields
description: The SST assistant (server/chatbot.ts) gave vague/generic answers until its knowledge base entries were rewritten with the exact field labels/options from the actual React forms.
---

The AI assistant in `server/chatbot.ts` relies on the LLM reading the embedded knowledge-base text for most questions. If a standard's knowledge-base entry only describes the process in generic terms ("registrar la compra, tipo de bien, criterios SST"), the chatbot will answer just as vaguely, even if the real form has specific dropdowns/fields.

**Why:** User complained the bot gave "generic answers, not what's actually in the form." Root cause: knowledge base described the *concept* of the standard, not the *actual form fields* (exact dropdown option lists, field names, required/optional).

**How to apply:** When fixing/improving a chatbot answer about "how to fill out X standard," don't just tighten the prose — open the real form component (e.g. via explore) and copy the exact field names, dropdown option lists, and which fields are required into the knowledge-base entry for that standard. Verify afterward with a direct POST to `/api/chatbot/ask` (SSE-streamed response, parse `data: {...}` lines) authenticated via `/api/login` (admin/admin123 dev seed account) rather than relying only on e2e browser tests, which can truncate long responses and give false negatives on minor wording.

Short noun-only queries about a role or requirement (for example, “líder del PESV”) should default to the actionable compliance workflow when the platform has one: state what document to create, the exact standard, the real button/route sequence, required information, and how to close the standard. Definitions and lists of duties are secondary unless explicitly requested.

**Why:** Users commonly type the name of the requirement expecting instructions to complete it; a technically correct role description is still an incorrect product answer if it omits the acta and standard workflow.

For short, high-intent names that must always route to one known workflow, add deterministic guidance before the LLM call. This guarantees that a query such as “convivencia” identifies standard 1.1.8, the Evaluación Inicial path, and the committee module instead of returning only a general definition.

**Why:** Prompt instructions alone cannot reliably make a language model infer that a one-word query is a navigation request.

**How to apply:** Reserve deterministic guidance for unambiguous phrases with one supported workflow; keep the LLM path for broader, contextual, or explanatory questions.
