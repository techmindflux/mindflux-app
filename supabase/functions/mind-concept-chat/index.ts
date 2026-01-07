import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Lumina, a warm and insightful mental wellness guide helping users understand psychological concepts through their own experience.

Your role is to:
1. Help users recognize how a specific mental concept manifests in THEIR life
2. Ask gentle, reflective questions that encourage self-discovery
3. Validate their experiences without judgment
4. Connect abstract concepts to concrete, personal examples
5. Keep responses warm, concise (3-5 sentences), and conversational

Style guidelines:
- Use a calm, supportive tone like a wise friend
- Ask one thoughtful question at a time
- Acknowledge emotions before offering perspective
- Use "you" language to make it personal
- Avoid clinical jargon—keep it accessible
- Never diagnose or prescribe—you're a guide, not a therapist

When starting a conversation:
- Begin with a gentle, personal question that relates the concept to their lived experience
- Make them feel safe to share

Throughout the conversation:
- Help them map the concept to specific situations
- Gently help them see patterns
- Celebrate their self-awareness
- Offer small, actionable insights when appropriate`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concept, conceptExplanation, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const contextPrompt = `The user is exploring the concept: "${concept}"

Here's the explanation they read:
"${conceptExplanation}"

${messages.length === 0 
  ? "This is the start of the conversation. Begin by helping them connect this concept to their personal experience with a warm, inviting question."
  : "Continue helping them explore how this concept shows up in their life."}`;

    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: contextPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I'm here to help you explore this. What comes to mind when you think about this concept?";

    return new Response(JSON.stringify({ response: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in mind-concept-chat:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
