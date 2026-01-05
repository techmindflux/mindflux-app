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
    const { feelings, category } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    
    if (!PERPLEXITY_API_KEY) {
      console.error("PERPLEXITY_API_KEY not configured");
      return new Response(JSON.stringify({ recommendations: [], error: "Search not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const feelingsText = feelings.join(", ");
    const categoryContext = category === "grounded" || category === "activated" 
      ? "maintain and enhance their positive state"
      : "overcome and improve their emotional state";

    console.log("Generating recommendations for:", { feelings, category });

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
            content: `You are a mental wellness expert. Return exactly 6 YouTube video recommendations as a JSON array. Each recommendation must have: title (string), description (short 1-sentence description), youtubeQuery (search query to find this video on YouTube), type (one of: meditation, breathing, motivation, education, exercise, music). Focus on actionable, calming, and helpful content.` 
          },
          { 
            role: "user", 
            content: `A person is feeling ${feelingsText} (category: ${category}). They want to ${categoryContext}. Suggest 6 specific YouTube videos or types of content that would help. Return ONLY a valid JSON array with no markdown formatting.` 
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity error:", response.status, errorText);
      return new Response(JSON.stringify({ recommendations: getDefaultRecommendations(category) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log("AI response:", content);

    // Parse the JSON from the response
    let recommendations = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      recommendations = getDefaultRecommendations(category);
    }

    // Ensure we have valid recommendations
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      recommendations = getDefaultRecommendations(category);
    }

    // Add YouTube search URLs
    recommendations = recommendations.slice(0, 6).map((rec: any, index: number) => ({
      id: index + 1,
      title: rec.title || "Relaxation Video",
      description: rec.description || "A helpful wellness video",
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.youtubeQuery || rec.title || "meditation relaxation")}`,
      type: rec.type || "meditation",
    }));

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("wellness-recommendations error:", error);
    return new Response(JSON.stringify({ 
      recommendations: getDefaultRecommendations("grounded"),
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDefaultRecommendations(category: string) {
  const defaults: Record<string, any[]> = {
    overwhelmed: [
      { id: 1, title: "5-Minute Anxiety Relief", description: "Quick breathing exercise for instant calm", youtubeUrl: "https://www.youtube.com/results?search_query=5+minute+anxiety+relief+breathing", type: "breathing" },
      { id: 2, title: "Calming Nature Sounds", description: "Peaceful ambient sounds to reduce stress", youtubeUrl: "https://www.youtube.com/results?search_query=calming+nature+sounds+stress+relief", type: "music" },
      { id: 3, title: "Guided Meditation for Stress", description: "Let go of tension with this guided session", youtubeUrl: "https://www.youtube.com/results?search_query=guided+meditation+stress+relief", type: "meditation" },
      { id: 4, title: "Understanding Anxiety", description: "Learn why anxiety happens and how to manage it", youtubeUrl: "https://www.youtube.com/results?search_query=understanding+anxiety+explained", type: "education" },
      { id: 5, title: "Progressive Muscle Relaxation", description: "Release physical tension step by step", youtubeUrl: "https://www.youtube.com/results?search_query=progressive+muscle+relaxation+guided", type: "exercise" },
      { id: 6, title: "You Are Not Alone", description: "Motivational talk about overcoming stress", youtubeUrl: "https://www.youtube.com/results?search_query=motivational+speech+overcoming+stress", type: "motivation" },
    ],
    activated: [
      { id: 1, title: "Focus Flow Music", description: "Enhance your productivity with focused beats", youtubeUrl: "https://www.youtube.com/results?search_query=focus+flow+music+productivity", type: "music" },
      { id: 2, title: "Power Morning Routine", description: "Start your day with energy and purpose", youtubeUrl: "https://www.youtube.com/results?search_query=power+morning+routine+motivation", type: "motivation" },
      { id: 3, title: "High Performance Mindset", description: "Learn from peak performers", youtubeUrl: "https://www.youtube.com/results?search_query=high+performance+mindset+tips", type: "education" },
      { id: 4, title: "Quick Energy Workout", description: "15-minute workout to boost energy", youtubeUrl: "https://www.youtube.com/results?search_query=quick+energy+workout+15+minutes", type: "exercise" },
      { id: 5, title: "Focus Breathing Technique", description: "Sharpen your concentration", youtubeUrl: "https://www.youtube.com/results?search_query=focus+breathing+technique+concentration", type: "breathing" },
      { id: 6, title: "Mindful Productivity", description: "Balance focus with presence", youtubeUrl: "https://www.youtube.com/results?search_query=mindful+productivity+meditation", type: "meditation" },
    ],
    drained: [
      { id: 1, title: "Gentle Yoga for Fatigue", description: "Restore energy with gentle movement", youtubeUrl: "https://www.youtube.com/results?search_query=gentle+yoga+for+fatigue+restore+energy", type: "exercise" },
      { id: 2, title: "Body Scan Meditation", description: "Release tension and find rest", youtubeUrl: "https://www.youtube.com/results?search_query=body+scan+meditation+relaxation", type: "meditation" },
      { id: 3, title: "Understanding Burnout", description: "Learn to recognize and recover from burnout", youtubeUrl: "https://www.youtube.com/results?search_query=understanding+burnout+recovery", type: "education" },
      { id: 4, title: "Soft Piano for Rest", description: "Calming music to help you unwind", youtubeUrl: "https://www.youtube.com/results?search_query=soft+piano+music+rest+relaxation", type: "music" },
      { id: 5, title: "Energizing Breathwork", description: "Gentle breathing to restore vitality", youtubeUrl: "https://www.youtube.com/results?search_query=energizing+breathwork+restore+energy", type: "breathing" },
      { id: 6, title: "Self-Compassion Talk", description: "Be kind to yourself during difficult times", youtubeUrl: "https://www.youtube.com/results?search_query=self+compassion+motivation+talk", type: "motivation" },
    ],
    grounded: [
      { id: 1, title: "Gratitude Meditation", description: "Deepen your sense of contentment", youtubeUrl: "https://www.youtube.com/results?search_query=gratitude+meditation+guided", type: "meditation" },
      { id: 2, title: "Peaceful Nature Ambience", description: "Maintain your calm with nature sounds", youtubeUrl: "https://www.youtube.com/results?search_query=peaceful+nature+ambience+relaxation", type: "music" },
      { id: 3, title: "Mindfulness for Daily Life", description: "Integrate mindfulness into your routine", youtubeUrl: "https://www.youtube.com/results?search_query=mindfulness+for+daily+life+tips", type: "education" },
      { id: 4, title: "Gentle Stretching", description: "Maintain body awareness and flexibility", youtubeUrl: "https://www.youtube.com/results?search_query=gentle+stretching+routine+relaxation", type: "exercise" },
      { id: 5, title: "Box Breathing Practice", description: "Enhance your calm with structured breathing", youtubeUrl: "https://www.youtube.com/results?search_query=box+breathing+practice+calm", type: "breathing" },
      { id: 6, title: "Living in the Present", description: "Embrace the power of now", youtubeUrl: "https://www.youtube.com/results?search_query=living+in+the+present+moment+motivation", type: "motivation" },
    ],
  };

  return defaults[category] || defaults.grounded;
}
