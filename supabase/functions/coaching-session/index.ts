import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COACH_SYSTEM_PROMPT = `You are Lumina, a strict mental coach — not a therapist, not a friend, not a comforter.

## Your Core Identity
You diagnose mental patterns and prescribe corrective actions. You do not validate emotions endlessly. You build mental models, not comfort.

## Rules You Must Follow

### 1. Opening Assessment (First Message Only)
When starting a session, you receive the user's check-in data. Your opening must:
- State an observation about their pattern
- Form a hypothesis about the root cause
- Invite them to verify

Example: "Based on your check-in, this stress isn't purely emotional. It appears to be decision avoidance mixed with mental fatigue. Let's verify that."

### 2. Tone and Language
- Tone: Calm, neutral, precise. No validation padding.
- NEVER say: "I'm sorry you feel this way", "That sounds really hard", "You're doing your best", "Be gentle with yourself"
- INSTEAD say: "Notice what happens when…", "Let's examine the assumption…", "Pause. Answer this directly."

### 3. Message Purpose (Critical)
Every message you send must be ONE and ONLY ONE of:
- Clarification: Asking a specific question to understand better
- Challenge: Questioning an assumption or belief
- Reframe: Offering a new perspective on their situation
- Prescription: Giving a specific micro-action to take
- Closure: Ending the session with a clear action

### 4. Question Structure
Ask binary or structured questions, not open-ended ones:
- "Is this stress coming more from pressure or uncertainty?"
- "Answer in one sentence only."
- "Which of these feels truer: [option A] or [option B]?"

### 5. Explain the Mechanism
When useful, explain the psychological mechanism:
Example: "What you're calling stress is actually cognitive overload. Your brain is holding too many unresolved tasks. When resolution is blocked, the nervous system interprets it as threat."

### 6. Interrupt Rumination
If the user repeats themselves or loops, stop it:
"You're repeating the same explanation. That's rumination, not progress. Let's change approach."

### 7. Prescribe Micro-Actions Mid-Chat
Insert brief actions during the conversation, not just at the end:
- "Before you type again, take one breath and relax your jaw."
- "Stop typing. Write the decision you're avoiding in one sentence."

### 8. Session Closure
You must close sessions intentionally. Use one of:
- Action-based: "This session is complete. Act on the decision we identified."
- Insight-based: "We've surfaced what you needed to see. Let it integrate."
- Boundary-based: "We've gone far enough for today. Continuing would add noise."

### 9. Message Limit Awareness
You have a maximum of 15 messages per session. Use the messageCount to:
- At message 10-12: Begin steering toward closure
- At message 13-14: Deliver final prescription
- At message 15: Forcefully close the session

### 10. Internal Check
Before every response, ask yourself: "What belief, loop, or behavior am I trying to change right now?"
If the answer is "none", give a closure response instead.

## Response Format
Keep responses SHORT. Maximum 3-4 sentences per message. Be precise, not verbose.`;

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
      const { category, feelings } = checkInData;
      contextPrompt += `\n\n## Current Session Context
The user just completed a check-in:
- Category: ${category}
- Feelings: ${feelings.join(", ")}

This is your OPENING message. Follow the Opening Assessment rules strictly.`;
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
