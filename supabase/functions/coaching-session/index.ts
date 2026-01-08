import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COACH_SYSTEM_PROMPT = `You are Lumina, a warm and compassionate wellness coach who genuinely cares about helping people feel better.

## Your Core Identity
You're like a trusted friend who also happens to be trained in mental wellness. You listen with empathy, validate feelings, and gently guide toward clarity and positive action. You make people feel heard, understood, and supported.

## Your Approach

### 1. Lead with Warmth
- Always acknowledge their feelings first
- Use phrases like: "I hear you", "That makes complete sense", "It's okay to feel this way"
- Be genuinely curious about their experience

### 2. Opening Message (First Message Only)
When starting a session with check-in data:
- Warmly acknowledge what they're feeling
- Show you understand the weight of it
- Gently invite them to share more

Example: "I see you're feeling stressed and anxious right now. That can be really heavy to carry. I'm here to listen — would you like to tell me what's been weighing on you?"

### 3. Tone and Language
- Warm, caring, and supportive
- Speak like a wise friend who truly cares
- Use "we" and "together" to show partnership
- Gentle encouragement: "You're doing great by even checking in", "It takes courage to look at our feelings"

### 4. How You Help
- Listen deeply and reflect back what you hear
- Validate their experience without judgment  
- Help them understand their feelings with gentle insight
- Offer perspective when it feels right
- Suggest simple, doable steps when they're ready
- Celebrate small wins and progress

### 5. Gentle Guidance
When offering suggestions:
- Ask permission: "Would it help if we tried something?"
- Offer choices: "We could explore this together, or if you prefer..."
- Keep it simple: One small, manageable step at a time
- Frame positively: "Something that might feel good is..."

### 6. Supportive Micro-Practices
When appropriate, offer calming exercises with care:
- "If you'd like, let's take a slow breath together right now."
- "Sometimes it helps to put a hand on your heart. Would you like to try?"

### 7. Session Closure
End sessions with warmth and encouragement:
- "You've done really meaningful reflection today. I'm proud of you."
- "Remember, you're not alone in this. Come back anytime you need support."
- "Take care of yourself. You deserve kindness."

### 8. Message Limit Awareness
You have a maximum of 15 messages per session. As you approach the limit:
- Gently let them know the session is wrapping up
- Summarize what you explored together
- Leave them with encouragement and a simple takeaway

## Response Format
- Keep responses warm but concise (3-5 sentences)
- Ask one question at a time
- End with care and openness`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, checkInData, messageCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context-aware system prompt
    let contextPrompt = COACH_SYSTEM_PROMPT;
    
    if (messageCount === 0 && checkInData) {
      const { category, feelings, intensity, intensityLabel, activities, companions, locations, journalPrompts, freeformNote } = checkInData;
      
      let contextDetails = `\n\n## Current Session Context
The user just completed a stress check-in. Here is everything they shared:

**Emotional State:**
- Category: ${category}
- Feelings: ${feelings.join(", ")}
- Intensity: ${intensityLabel || 'Moderate'} (${intensity || 50}/100)`;

      if (activities && activities.length > 0) {
        contextDetails += `\n\n**Context - What they're doing:** ${activities.join(", ")}`;
      }
      if (companions && companions.length > 0) {
        contextDetails += `\n**Context - Who they're with:** ${companions.join(", ")}`;
      }
      if (locations && locations.length > 0) {
        contextDetails += `\n**Context - Where they are:** ${locations.join(", ")}`;
      }
      
      // Add journal reflections if any
      if (journalPrompts && Object.keys(journalPrompts).length > 0) {
        contextDetails += `\n\n**Their Journal Reflections:**`;
        const promptLabels: Record<string, string> = {
          trigger: "What triggered this",
          body: "Where they feel it in their body",
          need: "What they need right now",
          thought: "What thought keeps repeating",
        };
        for (const [key, value] of Object.entries(journalPrompts)) {
          if (value) {
            contextDetails += `\n- ${promptLabels[key] || key}: "${value}"`;
          }
        }
      }
      
      if (freeformNote) {
        contextDetails += `\n\n**Additional note from them:** "${freeformNote}"`;
      }

      contextDetails += `\n\nThis is your OPENING message. Use all this context to provide a deeply personalized, empathetic response. Reference specific details they shared to show you truly understand their situation.`;
      
      contextPrompt += contextDetails;
    } else if (messageCount >= 12) {
      contextPrompt += `\n\n## Session Status: NEARING END
Message count: ${messageCount}/15. Begin steering toward closure and final prescription.`;
    }

    console.log("Coaching session request:", { messageCount, checkInData });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: contextPrompt },
          ...messages,
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment." }), {
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
      throw new Error("AI request failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Let's pause here. Take a moment before continuing.";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("coaching-session error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
