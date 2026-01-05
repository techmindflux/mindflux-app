import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Lumina, a calm, empathetic, and supportive mental health coach. Your role is to help users understand and manage their stress through gentle conversation.

## Your Personality
- Warm, patient, and non-judgmental
- Speak in a calm, soothing tone
- Use simple, clear language
- Be present and focused on the user

## Guidelines
1. Listen actively and validate the user's feelings
2. Ask thoughtful follow-up questions to understand their situation
3. Offer gentle, actionable suggestions when appropriate
4. Never diagnose or provide medical advice
5. If someone mentions self-harm or crisis, encourage them to seek professional help
6. Keep responses concise (2-4 sentences) for voice conversation flow
7. Focus on practical stress management techniques: breathing, grounding, perspective

## Conversation Flow
- Start by warmly greeting and asking how they're feeling
- Explore what's causing their stress
- Validate their experience
- Offer a simple coping technique or reflection
- End with encouragement

Remember: You are a supportive companion, not a therapist. Your goal is to help users feel heard and give them simple tools to manage everyday stress.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, isInitial } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    // Format messages for Perplexity API
    // Perplexity requires user/tool and assistant messages to alternate (after optional system messages)
    const normalizeMessages = (msgs: Array<{ role: string; content: string }>) => {
      const out: Array<{ role: "user" | "assistant"; content: string }> = [];

      for (const m of msgs || []) {
        const role = m?.role === "user" || m?.role === "assistant" ? m.role : null;
        const content = (m?.content || "").trim();
        if (!role || !content) continue;

        // Perplexity expects the first non-system message to be from the user
        if (out.length === 0 && role !== "user") continue;

        const last = out[out.length - 1];
        if (last && last.role === role) {
          // Merge consecutive same-role messages to enforce alternation
          last.content = `${last.content}\n${content}`.trim();
        } else {
          out.push({ role, content });
        }
      }

      return out;
    };

    let formattedMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (isInitial || !Array.isArray(messages) || messages.length === 0) {
      // For initial greeting, add a starter user message
      formattedMessages.push({
        role: "user",
        content: "Hello, I'd like to do a stress check-in. Please greet me warmly and ask how I'm feeling today.",
      });
    } else {
      formattedMessages = [...formattedMessages, ...normalizeMessages(messages)];
    }

    console.log("Sending to Perplexity:", JSON.stringify({ messageCount: formattedMessages.length, isInitial }));

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: formattedMessages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      throw new Error(`Perplexity API failed: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "I'm here to listen. How are you feeling?";

    // Remove Perplexity citation markers like [1][2]
    const content = raw
      .replace(/\[\d+\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    console.log("Perplexity response received");

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("lumina-voice-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
