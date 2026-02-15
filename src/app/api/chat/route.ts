import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

// Simple in-memory rate limiter: max 10 messages per minute per user
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;
const MAX_MESSAGE_LENGTH = 2000;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(userId) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(userId, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return false;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (isRateLimited(user.id)) {
    return new Response("Too many messages. Please wait a moment.", { status: 429 });
  }

  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const { message } = body;

  if (!message || typeof message !== "string") {
    return new Response("Message is required", { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return new Response(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`, { status: 400 });
  }

  // Fetch event context for the system prompt
  const [eventRes, itineraryRes, checklistRes] = await Promise.all([
    supabase.from("event_info").select("*").limit(1).single(),
    supabase.from("itinerary_items").select("*").order("sort_order"),
    supabase.from("checklist_items").select("*").order("sort_order"),
  ]);

  const event = eventRes.data;
  const itinerary = itineraryRes.data || [];
  const checklist = checklistRes.data || [];

  const systemPrompt = `You are a helpful AI assistant for the "${event?.title || "PM Mastermind"}" event. You help attendees with questions about the event.

Here is the event information:
- Title: ${event?.title || "PM Mastermind"}
- Date: ${event?.event_date || "TBD"}
- Time: ${event?.event_time || "TBD"}
- Venue: ${event?.venue_name || "TBD"}
- Location: ${event?.location || "TBD"}
- Description: ${event?.description || "No description yet"}
- Notes: ${event?.additional_notes || "None"}

Itinerary:
${itinerary.length > 0 ? itinerary.map((item: { start_time?: string; end_time?: string; title: string; description?: string }) => `- ${item.start_time || ""}${item.end_time ? ` - ${item.end_time}` : ""}: ${item.title}${item.description ? ` (${item.description})` : ""}`).join("\n") : "No itinerary items yet."}

Pre-event checklist items:
${checklist.length > 0 ? checklist.map((item: { title: string; description?: string }) => `- ${item.title}${item.description ? `: ${item.description}` : ""}`).join("\n") : "No checklist items yet."}

Be friendly, concise, and helpful. If you don't know something about the event, say so honestly.`;

  // Fetch conversation history
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(50);

  const messages = [
    ...(history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: message },
  ];

  // Save user message
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "user",
    content: message,
  });

  // Stream response from Claude
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          const text = event.delta.text;
          fullResponse += text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }

      // Save assistant response
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: fullResponse,
      });

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
