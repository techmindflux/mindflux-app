import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GUIDE_SYSTEM_PROMPT = `You are a friendly, helpful guide for MindFlux - a mental wellness app focused on understanding and improving thought quality. Your ONLY purpose is to help users understand and navigate the app's features.

## What MindFlux Offers:
- **Thought Check-in**: Understand your current thought patterns by selecting from four categories:
  - Ruminating: Replaying, Looping, Stuck, Dwelling thoughts
  - Anxious: Worrying, Racing, Catastrophizing, Anticipating thoughts  
  - Critical: Judging, Comparing, Doubting, Criticizing thoughts
  - Clear: Present, Focused, Calm, Grounded thoughts
- **Intensity Slider**: Rate how strongly your thought patterns are affecting you
- **Journal Entry**: Add optional reflection prompts, activities, companions, and locations
- **Coaching Sessions**: After check-ins, have a supportive conversation with Lumina about your thought patterns
- **Lumina AI**: Your compassionate AI companion for mental wellness guidance
- **Thought Unpacker**: Analyze and visualize the roots of your thoughts
- **Dark/Light Mode**: Toggle between themes for comfortable viewing

## Navigation:
- Home screen: Your sanctuary - starting point with quick access to features
- Check-in: Tap the heart icon in the bottom navigation to start a Thought Check-in
- Lumina: Chat directly with your AI wellness companion
- The app uses a sleek bottom navigation bar for easy access to all features

## Your Guidelines:
1. Be warm, welcoming, and concise
2. ONLY answer questions about the app's features, navigation, and how to use it
3. If asked about technical implementation, code, development methods, APIs, or anything not user-facing, politely redirect: "I'm here to help you navigate and use MindFlux! Is there a feature you'd like to learn about?"
4. Keep responses brief - 2-3 sentences max unless explaining a feature in detail
5. Use friendly, encouraging language that matches the app's calming tone
6. If unsure, suggest the user explore the feature or try a check-in

Remember: You are NOT a therapist or wellness coach - that's Lumina's role during coaching sessions. You just help users find their way around the app.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: GUIDE_SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm a bit overwhelmed right now. Please try again in a moment." }), {
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm here to help! What would you like to know about MindFlux?";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("app-guide error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
