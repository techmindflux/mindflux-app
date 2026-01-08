import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { thought } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing thought:", thought);

    const systemPrompt = `You are a compassionate psychological analyst helping someone understand the origins of their thoughts. Your task is to trace a thought back to its root cause through 3-4 layers of analysis.

For each thought, create a tree structure that shows:
1. First layer: The immediate emotional or cognitive trigger behind the thought
2. Second layer: The underlying beliefs or past experiences that feed into those triggers  
3. Third layer: The deeper psychological needs or fears at play
4. Root cause: A single, clear statement of the fundamental core belief or wound

Guidelines:
- Be gentle and non-judgmental
- Use simple, relatable language
- Each node should be 1-2 sentences max
- The root cause should be insightful but not overwhelming
- Focus on universal human experiences

Respond with a JSON object in this exact format:
{
  "nodes": [
    { "id": "1a", "text": "First layer insight", "level": 0 },
    { "id": "2a", "text": "Second layer insight 1", "level": 1 },
    { "id": "2b", "text": "Second layer insight 2", "level": 1 },
    { "id": "3a", "text": "Third layer deeper insight", "level": 2 }
  ],
  "rootCause": "A clear, compassionate statement of the core belief or fear driving this thought pattern"
}

Keep the tree balanced with 4-6 nodes total. Level 0 should have 1-2 nodes, level 1 should have 1-2 nodes, level 2 should have 1 node.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze this thought and trace it to its root cause: "${thought}"` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to analyze thought" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    console.log("AI response:", content);

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Invalid response format");
    }

    return new Response(
      JSON.stringify({
        nodes: parsed.nodes || [],
        rootCause: parsed.rootCause || "Unable to determine root cause",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("thought-unpacker error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
