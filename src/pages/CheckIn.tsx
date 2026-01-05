import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";
import { Button } from "@/components/ui/button";
import { Mic, X, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Animated orb component
function VoiceOrb({ state }: { state: "idle" | "listening" | "thinking" | "speaking" }) {
  const isActive = state !== "idle";
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <div
        className={cn(
          "absolute w-48 h-48 rounded-full transition-all duration-700",
          state === "speaking" && "bg-primary/20 animate-pulse scale-110",
          state === "listening" && "bg-accent/20 animate-pulse scale-105",
          state === "thinking" && "bg-muted/20 scale-100",
          state === "idle" && "bg-muted/10 scale-95"
        )}
      />
      <div
        className={cn(
          "absolute w-36 h-36 rounded-full transition-all duration-500",
          state === "speaking" && "bg-primary/30 scale-105",
          state === "listening" && "bg-accent/30 scale-100",
          state === "thinking" && "bg-muted/30 scale-95",
          state === "idle" && "bg-muted/20 scale-90"
        )}
      />

      {/* Main orb */}
      <div
        className={cn(
          "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br border",
          state === "speaking" && "from-primary/60 to-primary/40 border-primary/40 shadow-lg shadow-primary/20",
          state === "listening" && "from-accent/60 to-accent/40 border-accent/40 shadow-lg shadow-accent/20",
          state === "thinking" && "from-muted/60 to-muted/40 border-muted/40",
          state === "idle" && "from-muted/40 to-muted/30 border-muted/30"
        )}
      >
        {/* Inner orb */}
        <div
          className={cn(
            "w-16 h-16 rounded-full transition-all duration-300",
            state === "speaking" && "bg-gradient-to-br from-primary to-primary/80 animate-pulse",
            state === "listening" && "bg-gradient-to-br from-accent to-accent/80 animate-pulse",
            state === "thinking" && "bg-gradient-to-br from-muted-foreground/50 to-muted-foreground/30 animate-spin-slow",
            state === "idle" && "bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/20"
          )}
        />
      </div>

      {/* Sound wave bars for listening state */}
      {state === "listening" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-accent rounded-full animate-sound-wave"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: "20px",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// State label
function StateLabel({ state }: { state: "idle" | "listening" | "thinking" | "speaking" }) {
  const labels = {
    idle: "Tap to start",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Lumina",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-2 h-2 rounded-full transition-colors",
          state === "speaking" && "bg-primary animate-pulse",
          state === "listening" && "bg-accent animate-pulse",
          state === "thinking" && "bg-muted-foreground animate-pulse",
          state === "idle" && "bg-muted-foreground/50"
        )}
      />
      <span className="text-sm text-muted-foreground font-medium">
        {labels[state]}
      </span>
    </div>
  );
}

export default function CheckIn() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { messages, state, error, start, stop, isActive } = useVoiceConversation();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEnd = () => {
    stop();
    navigate("/home");
  };

  const handleToggle = () => {
    if (isActive) {
      stop();
    } else {
      start();
    }
  };

  // Get the last assistant message for display
  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1)[0];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-muted/20" />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] transition-all duration-1000",
            state === "speaking" && "bg-primary/15 scale-110",
            state === "listening" && "bg-accent/15 scale-105",
            state === "thinking" && "bg-muted/15 scale-100",
            state === "idle" && "bg-muted/10 scale-95"
          )}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEnd}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>

        <StateLabel state={state} />

        <div className="w-10" />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-48">
        {/* Voice orb */}
        <div className="mb-16">
          <VoiceOrb state={state} />
        </div>

        {/* Message display */}
        <div className="w-full max-w-md min-h-[120px] flex items-start justify-center px-4">
          {lastAssistantMessage ? (
            <p className="text-foreground text-center text-lg leading-relaxed font-serif animate-fade-in">
              "{lastAssistantMessage.content}"
            </p>
          ) : state === "thinking" ? (
            <p className="text-muted-foreground text-center italic">Lumina is preparing...</p>
          ) : state === "listening" ? (
            <p className="text-muted-foreground text-center italic">Speak now...</p>
          ) : (
            <p className="text-muted-foreground text-center">
              Start a voice check-in with Lumina
            </p>
          )}
        </div>

        {/* Error display */}
        {error && (
          <p className="text-destructive text-sm text-center mt-4 px-4">{error}</p>
        )}
      </main>

      {/* Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-12 pt-8 bg-gradient-to-t from-background via-background to-transparent">
        {/* Mic button */}
        <button
          onClick={handleToggle}
          disabled={state === "thinking" || state === "speaking"}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 mb-4",
            isActive
              ? "bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20"
              : "bg-foreground/10 border-2 border-foreground/20 hover:bg-foreground/15 hover:border-foreground/30 hover:scale-105",
            (state === "thinking" || state === "speaking") && "opacity-70 cursor-not-allowed"
          )}
          aria-label={isActive ? "End session" : "Start session"}
        >
          {isActive ? (
            <MicOff className="w-7 h-7" />
          ) : (
            <Mic className="w-7 h-7 text-foreground" />
          )}
        </button>

        {/* Hint text */}
        <p className="text-sm text-muted-foreground">
          {state === "thinking"
            ? "Processing..."
            : state === "speaking"
            ? "Lumina is speaking"
            : isActive
            ? "Tap to end"
            : "Tap to begin"}
        </p>

        {/* End link */}
        {isActive && (
          <button
            onClick={handleEnd}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            End conversation
          </button>
        )}
      </div>
    </div>
  );
}
