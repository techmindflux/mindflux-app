import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLumina } from "@/hooks/useLumina";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useTranscription } from "@/hooks/useTranscription";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Square, Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckIn() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    messages, 
    isLoading: luminaLoading, 
    isSpeaking,
    isComplete,
    sendMessage, 
    startConversation,
    error: luminaError 
  } = useLumina();
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    error: recorderError 
  } = useVoiceRecorder();
  const { 
    transcribe, 
    isTranscribing, 
    error: transcriptionError 
  } = useTranscription();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleStart = useCallback(async () => {
    setHasStarted(true);
    await startConversation();
  }, [startConversation]);

  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      // Stop recording and transcribe
      const audioBase64 = await stopRecording();
      if (audioBase64) {
        const transcript = await transcribe(audioBase64);
        if (transcript) {
          setUserTranscript(transcript);
          await sendMessage(transcript);
        }
      }
    } else {
      // Start recording
      setUserTranscript("");
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, transcribe, sendMessage]);

  const handleFinish = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  const error = luminaError || recorderError || transcriptionError;
  const isProcessing = luminaLoading || isTranscribing;

  // Get the last assistant message
  const lastMessage = messages.filter(m => m.role === "assistant").slice(-1)[0];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="ambient-glow animate-breathe" 
          style={{
            top: '-15%',
            left: '-10%',
            width: '50%',
            height: '45%',
            background: 'hsl(var(--primary) / 0.3)',
          }}
        />
        <div 
          className="ambient-glow animate-breathe delay-500" 
          style={{
            bottom: '5%',
            right: '-15%',
            width: '55%',
            height: '50%',
            background: 'hsl(var(--accent) / 0.25)',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center px-6 pt-14 pb-4">
        <Button
          variant="glass"
          size="icon"
          onClick={() => navigate("/home")}
          className="rounded-full"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-display font-medium text-foreground">
            Stress Check-in
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">with Lumina</p>
        </div>
        <div className="w-11" /> {/* Spacer for balance */}
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 flex flex-col items-center justify-center pb-32">
        {!hasStarted ? (
          /* Pre-start state */
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="w-32 h-32 rounded-full glass-card flex items-center justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
                <Volume2 className="w-10 h-10 text-foreground/70" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-light text-foreground mb-3">
              Meet Lumina
            </h2>
            <p className="text-muted-foreground max-w-[280px] mb-8 leading-relaxed">
              Your calm mental coach. Lumina will ask a few questions to understand how you're feeling.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleStart}
              className="rounded-2xl"
            >
              Begin Check-in
            </Button>
          </div>
        ) : (
          /* Conversation state */
          <div className="flex flex-col items-center w-full max-w-sm animate-fade-in">
            {/* Lumina avatar/speaking indicator */}
            <div className={cn(
              "w-28 h-28 rounded-full glass-card flex items-center justify-center mb-6 transition-all duration-500",
              isSpeaking && "ring-4 ring-primary/30 scale-105"
            )}>
              <div className={cn(
                "w-18 h-18 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center transition-all duration-300",
                isSpeaking && "animate-pulse"
              )}>
                {isSpeaking ? (
                  <Volume2 className="w-8 h-8 text-foreground/80" />
                ) : isProcessing ? (
                  <Loader2 className="w-8 h-8 text-foreground/80 animate-spin" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-foreground/20" />
                )}
              </div>
            </div>

            {/* Message display */}
            <div className="glass-card p-6 rounded-2xl w-full mb-6 min-h-[120px] flex items-center justify-center">
              {lastMessage ? (
                <p className="text-foreground text-center leading-relaxed">
                  {lastMessage.content}
                </p>
              ) : luminaLoading ? (
                <p className="text-muted-foreground text-center">Lumina is thinking...</p>
              ) : (
                <p className="text-muted-foreground text-center">Starting conversation...</p>
              )}
            </div>

            {/* User transcript preview */}
            {userTranscript && (
              <div className="w-full mb-4 px-4">
                <p className="text-sm text-muted-foreground text-center italic">
                  "{userTranscript}"
                </p>
              </div>
            )}

            {/* Error display */}
            {error && (
              <p className="text-destructive text-sm text-center mb-4">{error}</p>
            )}

            {/* Controls */}
            {isComplete ? (
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleFinish}
                className="rounded-2xl mt-4"
              >
                Finish Check-in
              </Button>
            ) : (
              <button
                onClick={handleRecordToggle}
                disabled={isProcessing || isSpeaking}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                  isRecording 
                    ? "bg-destructive text-destructive-foreground scale-110 animate-pulse" 
                    : "glass-card hover:scale-105",
                  (isProcessing || isSpeaking) && "opacity-50 cursor-not-allowed"
                )}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8 text-foreground" />
                )}
              </button>
            )}

            {/* Recording hint */}
            {!isComplete && !isProcessing && !isSpeaking && (
              <p className="text-sm text-muted-foreground mt-4">
                {isRecording ? "Tap to stop" : "Tap to speak"}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
