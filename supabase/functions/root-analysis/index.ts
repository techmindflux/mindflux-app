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
    const { rootCause, originalThought } = await req.json();

    if (!rootCause) {
      return new Response(
        JSON.stringify({ error: "Root cause is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const prompt = `I've identified a psychological root cause behind my negative thought pattern. The root cause is: "${rootCause}"

The original thought was: "${originalThought}"

Please provide a comprehensive but compassionate analysis that helps me understand and work through this root cause. Include:

1. **Understanding the Root**: A brief psychological explanation of why this belief/pattern develops in people (2-3 sentences)

2. **The Truth Reframe**: A powerful reframing perspective that challenges this root belief with evidence-based thinking

3. **Wisdom & Quotes**: 2-3 relevant quotes from philosophers, psychologists, or thought leaders that speak to overcoming this pattern

4. **Practical Steps**: 3 specific, actionable practices I can start today to begin healing this root cause

5. **Affirmation**: A single powerful affirmation I can use when this thought pattern arises

Keep the tone warm, supportive, and empowering. Focus on growth and self-compassion rather than judgment.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are a compassionate mental wellness guide with deep knowledge of psychology, cognitive behavioral therapy, and mindfulness practices. Your role is to help people understand their thought patterns and provide actionable guidance for personal growth. Be warm, insightful, and empowering.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    // Parse the content into structured sections
    const sections = parseAnalysisContent(content);

    return new Response(
      JSON.stringify({
        analysis: sections,
        citations: citations,
        rawContent: content,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Root analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze root cause";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseAnalysisContent(content: string) {
  const sections: Record<string, string> = {};
  
  // Try to extract sections based on markdown headers
  const understandingMatch = content.match(/\*\*Understanding the Root\*\*:?\s*([\s\S]*?)(?=\*\*The Truth Reframe\*\*|\*\*Wisdom|$)/i);
  const reframeMatch = content.match(/\*\*The Truth Reframe\*\*:?\s*([\s\S]*?)(?=\*\*Wisdom|\*\*Practical|$)/i);
  const wisdomMatch = content.match(/\*\*Wisdom\s*(?:&|and)?\s*Quotes?\*\*:?\s*([\s\S]*?)(?=\*\*Practical|$)/i);
  const practicalMatch = content.match(/\*\*Practical Steps?\*\*:?\s*([\s\S]*?)(?=\*\*Affirmation|$)/i);
  const affirmationMatch = content.match(/\*\*Affirmation\*\*:?\s*([\s\S]*?)$/i);

  sections.understanding = understandingMatch?.[1]?.trim() || "";
  sections.reframe = reframeMatch?.[1]?.trim() || "";
  sections.wisdom = wisdomMatch?.[1]?.trim() || "";
  sections.practical = practicalMatch?.[1]?.trim() || "";
  sections.affirmation = affirmationMatch?.[1]?.trim() || "";

  // Clean up any remaining markdown artifacts
  Object.keys(sections).forEach(key => {
    sections[key] = sections[key]
      .replace(/^\*\*\d+\.\s*/gm, "")
      .replace(/\[[\d,\s]+\]/g, "") // Remove citation markers like [1] [2,3]
      .trim();
  });

  return sections;
}
