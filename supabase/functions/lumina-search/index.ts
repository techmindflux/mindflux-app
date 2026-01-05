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
    const { query } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    
    if (!PERPLEXITY_API_KEY) {
      console.error("PERPLEXITY_API_KEY not configured");
      return new Response(JSON.stringify({ sources: [], error: "Search not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Searching for:", query);

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant that finds mental wellness resources. Return helpful resources for the topic." 
          },
          { 
            role: "user", 
            content: `Find 3-4 helpful resources (YouTube videos, books, articles, podcasts) for someone dealing with: ${query}. Focus on practical, actionable mental wellness content.` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity error:", response.status, errorText);
      return new Response(JSON.stringify({ sources: [], content: "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    console.log("Found citations:", citations.length);

    // Transform citations into source objects
    const sources = citations.slice(0, 5).map((url: string, index: number) => {
      // Extract domain for display
      let domain = "";
      let type = "article";
      try {
        const urlObj = new URL(url);
        domain = urlObj.hostname.replace("www.", "");
        
        // Determine type based on domain
        if (domain.includes("youtube") || domain.includes("youtu.be")) {
          type = "video";
        } else if (domain.includes("spotify") || domain.includes("podcast")) {
          type = "podcast";
        } else if (domain.includes("amazon") || domain.includes("goodreads")) {
          type = "book";
        }
      } catch {
        domain = url.slice(0, 30);
      }

      return {
        id: index + 1,
        url,
        domain,
        type,
      };
    });

    return new Response(JSON.stringify({ sources, content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("lumina-search error:", error);
    return new Response(JSON.stringify({ sources: [], error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
