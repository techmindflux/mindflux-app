import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Sparkles, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ThoughtTree } from "@/components/ThoughtTree";

interface ThoughtNode {
  id: string;
  text: string;
  level: number;
  isRoot?: boolean;
}

const thoughtSuggestions = [
  "I'm not good enough for this job",
  "Everyone is judging me",
  "I can't handle this anymore",
  "What if I fail?",
  "I should be further ahead by now",
  "Nobody really understands me",
];

export default function ThoughtUnpacker() {
  const navigate = useNavigate();
  const [thought, setThought] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nodes, setNodes] = useState<ThoughtNode[]>([]);
  const [showTree, setShowTree] = useState(false);
  const [rootCause, setRootCause] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!thought.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setShowTree(false);
    setNodes([]);
    setRootCause("");

    try {
      const { data, error } = await supabase.functions.invoke("thought-unpacker", {
        body: { thought: thought.trim() },
      });

      if (error) throw error;

      if (data?.nodes && data?.rootCause) {
        setNodes(data.nodes);
        setRootCause(data.rootCause);
        setShowTree(true);
      }
    } catch (error) {
      console.error("Failed to analyze thought:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setThought("");
    setShowTree(false);
    setNodes([]);
    setRootCause("");
    textareaRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setThought(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-breathe delay-300" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 px-6 pt-8 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/explore")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-light text-foreground tracking-tight">
            Thought Unpacker
          </h1>
          <p className="text-sm text-muted-foreground">
            Trace your thoughts to their origins
          </p>
        </div>
      </header>

      {!showTree ? (
        /* Input Phase */
        <div className="relative z-10 px-6 pt-8 pb-32 animate-fade-in">
          {/* Intro Text */}
          <div className="max-w-md mx-auto text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Share a thought that's been weighing on you. We'll explore where it comes from to help you see it more clearly.
            </p>
          </div>

          {/* Thought Input */}
          <div className="max-w-lg mx-auto space-y-6">
            <div className="glass-card p-4">
              <Textarea
                ref={textareaRef}
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="What thought is on your mind?"
                className="min-h-[120px] border-0 bg-transparent resize-none focus-visible:ring-0 text-base placeholder:text-muted-foreground/50"
                disabled={isAnalyzing}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!thought.trim() || isAnalyzing}
              className="w-full rounded-full h-12 text-base"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Tracing origins...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Unpack this thought
                </>
              )}
            </Button>

            {/* Suggestions */}
            <div className="pt-4">
              <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mb-3 text-center">
                Or try one of these
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {thoughtSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isAnalyzing}
                    className="px-3 py-1.5 text-xs rounded-full border border-border/50 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground hover:border-border transition-all duration-200 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tree Visualization Phase */
        <div className="relative z-10 flex flex-col h-[calc(100vh-100px)]">
          {/* Reset Button */}
          <div className="px-6 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try another thought
            </Button>
          </div>

          {/* Tree Container */}
          <div className="flex-1 px-4 overflow-y-auto pb-32">
            <ThoughtTree
              originalThought={thought}
              nodes={nodes}
              rootCause={rootCause}
            />
          </div>
        </div>
      )}
    </main>
  );
}
