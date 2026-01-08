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
    const { query, context, topicTitle, isInitial } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!PERPLEXITY_API_KEY) {
      console.error("PERPLEXITY_API_KEY not configured");
      return new Response(JSON.stringify({ sources: [], content: "Search is not configured.", error: "API key missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Library query:", query, "isInitial:", isInitial);

    const systemPrompt = isInitial
      ? `You are a knowledgeable mental wellness guide creating an educational article. Write in a warm, supportive tone.

Structure your response as follows:
1. Start with a brief, engaging introduction (2-3 sentences)
2. Include 3-4 main sections with clear headings using **bold** formatting
3. Each section should have practical, actionable advice
4. Include specific techniques, exercises, or strategies
5. End with an encouraging closing thought

Keep the total response between 400-600 words. Focus on evidence-based information that readers can apply immediately.`
      : `You are a supportive mental wellness guide helping someone learn about ${topicTitle || "mental wellness"}. 

Previous conversation context:
${context || "No previous context."}

Provide helpful, evidence-based information in a warm, conversational tone. Include practical tips when relevant. Keep responses concise but thorough (150-300 words).`;

    const userPrompt = isInitial
      ? `Create a comprehensive, beautifully structured guide about: ${query}`
      : query;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          sources: [], 
          content: "I'm receiving too many requests right now. Please try again in a moment.",
          error: "Rate limited" 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ sources: [], content: "I couldn't retrieve the information. Please try again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    console.log("Found citations:", citations.length);

    // Clean citation markers from content for cleaner display
    content = content.replace(/\[\d+\]/g, "");

    // Transform citations into rich source objects
    const sources = citations.slice(0, 6).map((url: string, index: number) => {
      let domain = "";
      let type: "video" | "book" | "podcast" | "article" = "article";
      let title = "";

      try {
        const urlObj = new URL(url);
        domain = urlObj.hostname.replace("www.", "");

        // Determine type and extract title hints from URL
        if (domain.includes("youtube") || domain.includes("youtu.be")) {
          type = "video";
          title = "Video Resource";
        } else if (domain.includes("spotify") || domain.includes("podcast") || domain.includes("anchor.fm")) {
          type = "podcast";
          title = "Podcast Episode";
        } else if (domain.includes("amazon") || domain.includes("goodreads") || domain.includes("books.google")) {
          type = "book";
          title = "Book Recommendation";
        } else if (domain.includes("healthline")) {
          title = "Healthline Article";
        } else if (domain.includes("psychologytoday")) {
          title = "Psychology Today";
        } else if (domain.includes("mayoclinic")) {
          title = "Mayo Clinic Guide";
        } else if (domain.includes("nih.gov") || domain.includes("ncbi")) {
          title = "NIH Research";
        } else if (domain.includes("verywellmind")) {
          title = "Verywell Mind";
        } else if (domain.includes("mindful.org")) {
          title = "Mindful.org";
        } else if (domain.includes("headspace")) {
          title = "Headspace Guide";
        } else if (domain.includes("calm.com")) {
          title = "Calm Resource";
        } else {
          // Create a readable title from domain
          title = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
        }
      } catch {
        domain = url.slice(0, 30);
        title = "Resource";
      }

      return {
        id: index + 1,
        url,
        domain,
        type,
        title,
      };
    });

    return new Response(JSON.stringify({ sources, content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("lumina-library error:", error);
    return new Response(JSON.stringify({ 
      sources: [], 
      content: "Something went wrong. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
