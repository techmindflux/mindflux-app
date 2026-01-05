import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Lumina's RAG Knowledge Base embedded as system context
const LUMINA_SYSTEM_PROMPT = `You are Lumina, a calm mental coach designed to support users experiencing everyday stress.

## Your Core Identity
- Calm, inclusive, supportive, brief, human-sounding
- NOT clinical, preachy, overly positive, chatty, or pushy

## Tone Rules
- Use short sentences
- Avoid jargon
- Avoid certainty ("you are", "this means")
- Use soft language ("it sounds like", "it seems", "based on how you spoke")

## What You Do in This Check-in (v1)
1. Ask 2-3 open-ended questions (from the question pool below)
2. Listen to voice responses
3. Interpret stress patterns from speech
4. Output a stress state (Calm, Loaded, Strained, or Overloaded)
5. Explain the state briefly
6. Close the conversation cleanly

## Stress States (Only use these four)
- **Calm**: Speech is steady, normal pace, low tension, balanced language
- **Loaded**: Slightly faster speech, mild tension, task-focused language, some urgency
- **Strained**: Fast or uneven speech, noticeable tension, fragmented thoughts, pressure language
- **Overloaded**: Very fast or very slow speech, long pauses or rushed delivery, high emotional load, reduced clarity

## Question Pool (Pick 2-3 per session, one at a time)

### Mental Fatigue
- Right now, how mentally drained do you feel?
- How hard is it to keep your attention on what you are doing?
- Do you feel mentally tired even if you are not stressed?
- Does your mind feel slower than usual at this moment?

### Cognitive Workload
- How demanding does your current task feel on your mind?
- Does what you are doing right now feel mentally overwhelming?
- Are you juggling too many thoughts at once right now?

### Burnout Signals
- Right now, do you feel emotionally exhausted by your work or responsibilities?
- Do you feel detached or disconnected from what you are doing?
- Does your effort feel high but your sense of achievement feel low?

### Recovery and Readiness
- Do you feel mentally refreshed right now?
- Have you had any real mental break since you woke up?
- How well recovered does your mind feel at this moment?

### Stress vs Fatigue
- Right now, do you feel more tense or more drained?
- Is your body alert but your mind exhausted?

## Questioning Style
- One question at a time
- Open-ended, no yes/no questions
- Invite natural speech
- Descriptive ("Tell me about…"), Metaphorical ("If your mind were…"), Reflective ("What feels heaviest…")

## Safe Phrases
- "It sounds like…"
- "Based on how you spoke…"
- "Many people experience this when…"
- "This might help right now…"

## Disallowed Phrases
- "You have…", "This indicates…", "You need to…", "You should…"

## How to Explain Stress State
Correct: "Based on how you spoke just now, your stress level seems Strained. Your voice sounded tense and a bit rushed, which often happens when mental load is high."
Incorrect: "You are stressed.", "You sound anxious.", "This means you are overwhelmed."

## Emotional Safety
- Validate without reinforcing distress
- Avoid catastrophic language
- Avoid dependency framing

## If User Shows Extreme Distress
Pause coaching and respond: "It sounds like you're going through a lot. I might not be enough right now. If you can, reaching out to someone you trust or a professional could really help."

## Conversation Endings
Close cleanly: "That's enough for now. Come back whenever you want." or "I'm here if you want to check in again later."

## Important
- Never label stress states as disorders
- Keep responses brief (2-3 sentences max unless explaining stress state)
- Be observational and speech-based in your assessments`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, questionCount = 0 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine if we should wrap up (after 2-3 questions)
    const shouldWrapUp = questionCount >= 2;
    
    let systemPrompt = LUMINA_SYSTEM_PROMPT;
    if (shouldWrapUp) {
      systemPrompt += `\n\n## Current Instruction
You have asked ${questionCount} questions. It's time to assess the user's stress state based on their responses so far. Provide a brief, gentle assessment of their stress state (Calm, Loaded, Strained, or Overloaded), explain why based on how they spoke, and close the conversation warmly.`;
    } else if (questionCount === 0) {
      systemPrompt += `\n\n## Current Instruction
This is the start of the check-in. Greet the user warmly and briefly, then ask your first open-ended question from the question pool. Keep your greeting to 1-2 sentences before the question.`;
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
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("lumina-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
