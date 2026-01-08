import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles, Send, Mic } from "lucide-react";
import { AppGuideChat } from "@/components/AppGuideChat";
import { ThoughtTree } from "@/components/ThoughtTree";
import { BreathingLoader } from "@/components/BreathingLoader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

interface ThoughtNode {
  id: string;
  text: string;
  level: number;
  isRoot?: boolean;
}

const thoughtSuggestions = [
  "I'm not good enough for this",
  "Everyone is judging me",
  "I'll never be successful",
  "Something bad is going to happen",
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, authType, logout, user, isLoading } = useAuth();

  // Thought Unpacker state
  const [thought, setThought] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [treeNodes, setTreeNodes] = useState<ThoughtNode[]>([]);
  const [rootCause, setRootCause] = useState<string | null>(null);
  const [showTree, setShowTree] = useState(false);

  // Voice input
  const { isListening, isSupported, toggleListening } = useVoiceInput({
    onTranscript: (text) => {
      setThought((prev) => (prev ? `${prev} ${text}` : text));
    },
    continuous: true,
  });

  // Get display name from user or default to guest
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSubmit = async () => {
    if (!thought.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setShowTree(true);

    try {
      const { data, error } = await supabase.functions.invoke("thought-unpacker", {
        body: { thought: thought.trim() },
      });

      if (error) throw error;

      if (data?.nodes && data?.rootCause) {
        setTreeNodes(data.nodes);
        setRootCause(data.rootCause);
      }
    } catch (error) {
      console.error("Error analyzing thought:", error);
      setShowTree(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setThought("");
    setTreeNodes([]);
    setRootCause(null);
    setShowTree(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setThought(suggestion);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Serene ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="ambient-glow animate-breathe"
          style={{
            top: "-10%",
            right: "-20%",
            width: "60%",
            height: "50%",
            background: "hsl(210 50% 80%)",
          }}
        />
        <div
          className="ambient-glow animate-breathe delay-300"
          style={{
            bottom: "10%",
            left: "-15%",
            width: "50%",
            height: "40%",
            background: "hsl(35 50% 85%)",
          }}
        />
        <div
          className="ambient-glow animate-breathe delay-500"
          style={{
            top: "40%",
            right: "-10%",
            width: "35%",
            height: "30%",
            background: "hsl(150 35% 80%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <div className="animate-fade-in">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {authType === "google" ? `Welcome, ${displayName || "back"}` : "Hello, Guest"}
          </p>
          <h1 className="text-3xl font-display font-light text-foreground mt-1">Your Sanctuary</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="glass" size="icon" onClick={handleLogout} className="rounded-full" aria-label="Sign out">
            <LogOut className="h-5 w-5 text-foreground" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 pb-32 overflow-y-auto">
        {!showTree ? (
          /* Input State */
          <div className="flex flex-col items-center text-center pt-8 animate-fade-in">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-display font-medium text-foreground mb-2">What's your MindFlux?</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-[280px]">
              Let's discover the roots of your thoughts and find clarity together.
            </p>

            {/* Thought Input */}
            <div className="w-full max-w-md">
              <div className="glass-card p-4 relative">
                <Textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder={
                    isListening ? "Listening... speak your thoughts" : "Share a thought that's been weighing on you..."
                  }
                  className="min-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/60"
                />
                <div className="flex items-center justify-between mt-3">
                  {/* Mic Button */}
                  {isSupported && (
                    <button
                      onClick={toggleListening}
                      className={cn(
                        "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                        isListening
                          ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/40"
                          : "bg-muted/60 border-muted-foreground/20 hover:bg-muted",
                      )}
                      aria-label={isListening ? "Stop recording" : "Start recording"}
                    >
                      <Mic
                        className={cn(
                          "w-5 h-5 transition-all",
                          isListening ? "text-white animate-pulse" : "text-muted-foreground",
                        )}
                      />
                      {/* Recording indicator */}
                      {isListening && (
                        <>
                          <span className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping" />
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse border-2 border-background" />
                        </>
                      )}
                    </button>
                  )}

                  {!isSupported && <div />}

                  <Button onClick={handleSubmit} disabled={!thought.trim() || isAnalyzing} className="rounded-xl gap-2">
                    {isAnalyzing ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Discover Roots
                  </Button>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="mt-8 w-full max-w-md">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Common thought patterns</p>
              <div className="flex flex-wrap justify-center gap-2">
                {thoughtSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm px-4 py-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isAnalyzing ? (
          /* Breathing Loader State */
          <div className="pt-4 animate-fade-in">
            <BreathingLoader />
          </div>
        ) : (
          /* Tree State */
          <div className="pt-4 animate-fade-in">
            <ThoughtTree
              originalThought={thought}
              nodes={treeNodes}
              rootCause={rootCause}
              isLoading={isAnalyzing}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* App Guide Chat */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 w-auto max-w-xs">
        <AppGuideChat />
      </div>
    </div>
  );
}
