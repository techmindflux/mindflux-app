import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { Button } from "@/components/ui/button";
import { Mic, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Audio visualization component
function AudioWaveform({ isActive, isSpeaking }: { isActive: boolean; isSpeaking: boolean }) {
  const bars = 5;
  
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            isActive || isSpeaking 
              ? "bg-primary animate-sound-wave" 
              : "bg-muted-foreground/30 h-2"
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isActive || isSpeaking ? undefined : "8px",
          }}
        />
      ))}
    </div>
  );
}

export default function CheckIn() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    messages, 
    isLoading, 
    isSpeaking,
    isRecording,
    error,
    startSession, 
    toggleRecording,
    endSession,
  } = useVoiceChat();
  
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Start session only from a user gesture (required for voice output)
  // We trigger this from the mic button on first tap.

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEnd = () => {
    endSession();
    navigate("/home");
  };

  // Get the last assistant message for display
  const lastAssistantMessage = messages.filter(m => m.role === "assistant").slice(-1)[0];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Dark overlay for voice mode feel */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-background/95" />
      
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] transition-all duration-1000",
            isSpeaking 
              ? "bg-primary/20 scale-110" 
              : isRecording 
                ? "bg-destructive/15 scale-105"
                : "bg-primary/10 scale-100"
          )}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEnd}
          className="rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </Button>
        
        {hasStarted && (
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full transition-colors duration-300",
              isSpeaking ? "bg-primary animate-pulse" : isLoading ? "bg-amber-500 animate-pulse" : "bg-green-500"
            )} />
            <span className="text-sm text-muted-foreground">
              {isSpeaking ? "Lumina is speaking" : isLoading ? "Processing..." : "Listening"}
            </span>
          </div>
        )}
        
        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-40">
        {/* Active conversation state - starts immediately */}
        <div className="flex flex-col items-center w-full max-w-md animate-fade-in">
          {/* Central Lumina orb with wave visualization */}
          <div className="relative mb-12">
            {/* Outer glow ring */}
            <div className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                isSpeaking 
                  ? "ring-[3px] ring-primary/40 scale-110" 
                  : isRecording 
                    ? "ring-[3px] ring-destructive/40 scale-105"
                    : "ring-0 scale-100"
              )} 
              style={{ width: "160px", height: "160px", margin: "-20px" }}
              />
              
              {/* Main orb */}
              <div className={cn(
                "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/20"
              )}>
                {/* Inner gradient orb */}
                <div className={cn(
                  "w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent transition-all duration-300",
                  isSpeaking && "animate-pulse scale-110",
                  isRecording && "scale-95"
                )} />
                
                {/* Loading indicator overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-foreground/80 animate-spin" />
                  </div>
                )}
              </div>
            </div>

          {/* Audio waveform visualization */}
          <div className="mb-8">
            <AudioWaveform isActive={isRecording} isSpeaking={isSpeaking} />
          </div>

          {/* Message display */}
          <div className="w-full min-h-[100px] flex items-center justify-center px-4 mb-8">
            {lastAssistantMessage ? (
              <p className="text-foreground text-center text-lg leading-relaxed animate-fade-in">
                {lastAssistantMessage.content}
              </p>
            ) : isLoading ? (
              <p className="text-muted-foreground text-center">Lumina is thinking...</p>
            ) : null}
          </div>

          {/* Error display */}
          {error && (
            <p className="text-destructive text-sm text-center mb-6 px-4">{error}</p>
          )}
        </div>
      </main>

      {/* Bottom controls - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-12 pt-8 bg-gradient-to-t from-background via-background/95 to-transparent">
        {/* Mic button */}
        <button
          onClick={async () => {
            if (!hasStarted) {
              setHasStarted(true);
              await startSession();
              return;
            }
            await toggleRecording();
          }}
          disabled={isLoading || isSpeaking}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 mb-4",
            isRecording 
              ? "bg-destructive text-destructive-foreground scale-110" 
              : "bg-foreground/10 border-2 border-foreground/20 hover:bg-foreground/15 hover:scale-105",
            (isLoading || isSpeaking) && "opacity-50 cursor-not-allowed"
          )}
          aria-label={!hasStarted ? "Start session" : isRecording ? "Stop recording" : "Start recording"}
        >
          <Mic className={cn(
            "w-8 h-8",
            isRecording ? "text-white" : "text-foreground"
          )} />
        </button>
        
        {/* Hint text */}
        <p className="text-sm text-muted-foreground">
          {!hasStarted ? "Tap to start" : isRecording ? "Listening..." : isSpeaking ? "Listening..." : isLoading ? "Processing..." : "Tap to speak"}
        </p>

        {/* End conversation link */}
        <button 
          onClick={handleEnd}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          End conversation
        </button>
      </div>
    </div>
  );
}
