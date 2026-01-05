import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Leaf, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const LUMINA_SYSTEM_PROMPT = `You are Lumina, a calm, grounded, non-judgmental mental wellness companion inside the MindFlux app.

Your role:
- You are NOT a therapist or medical professional
- Focus on self-reflection, emotional awareness, stress reduction, and mental clarity
- Be present, empathetic, and concise
- Never be preachy or alarmist
- Communicate like a wise, gentle guide

Topics you can discuss:
1. Stress & Burnout - daily stress, work pressure, overwhelm, mental fatigue
2. Anxiety & Overthinking - racing thoughts, worry, difficulty relaxing
3. Emotional Awareness - understanding emotions, mood swings, identifying triggers
4. Self-Reflection & Clarity - "why am I feeling this way?", feeling stuck, lack of motivation
5. Mindfulness & Grounding - breathing techniques, body awareness, present-moment grounding
6. Habits & Mental Hygiene - sleep routines, digital overload, work-life balance

Behavioral rules:
- Ask open-ended, reflective questions
- Validate emotions without reinforcing negative beliefs
- Offer simple, optional exercises, never commands
- Keep responses short to medium length (2-4 sentences typically)
- Avoid jargon or clinical language
- Avoid excessive positivity or platitudes

Topics to AVOID:
- Diagnosing mental health conditions
- Medical or psychiatric advice
- Self-harm methods or suicidal ideation in detail
- Encouraging dependency on AI

If high-risk emotional distress is detected:
- Respond calmly
- Encourage seeking professional or trusted human support
- Avoid panic or emergency framing

Conversation flow:
1. Acknowledge the user's message
2. Reflect back key emotional themes
3. Ask one gentle follow-up question OR offer one small practice/perspective

Example responses:
"That sounds mentally exhausting. Would you like to explore what's been weighing on you the most today?"
"Not knowing is also a valid state. If you had to describe it physically, where do you feel it in your body?"`;

export default function LuminaChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send initial greeting
    const greeting: Message = {
      role: "assistant",
      content: "Hello. I'm Lumina, your mental wellness companion. This is a safe space to explore how you're feeling. What's on your mind today?"
    };
    setMessages([greeting]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lumina-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          questionCount: messages.filter(m => m.role === "assistant").length,
          systemPrompt: LUMINA_SYSTEM_PROMPT,
          isChat: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = { role: "assistant", content: data.content };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: "I feel stressed", icon: Wind },
    { label: "Help me reflect", icon: Sparkles },
    { label: "Grounding exercise", icon: Leaf },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="ambient-glow w-[500px] h-[500px] -top-48 -right-48 bg-primary/20 animate-breathe" />
        <div className="ambient-glow w-[400px] h-[400px] bottom-32 -left-32 bg-accent/30 animate-breathe delay-300" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 px-4 py-4 border-b border-border/30">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-medium">Lumina</h1>
            <p className="text-xs text-muted-foreground">Your wellness companion</p>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex animate-fade-in",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "glass-card rounded-bl-md"
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-100" />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-200" />
                </div>
                <span className="text-xs text-muted-foreground">Lumina is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions (show when no messages or after greeting) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  setInput(action.label);
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass-button text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="relative z-10 p-4 border-t border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <div className="flex-1 glass-card rounded-2xl overflow-hidden">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              rows={1}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <Button
            size="icon"
            className="rounded-full h-11 w-11 shrink-0"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
          Lumina is not a therapist. For crisis support, please contact a professional.
        </p>
      </div>
    </div>
  );
}
