import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Brain, 
  Lightbulb, 
  Quote, 
  Target, 
  Sparkles, 
  ChevronDown,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface RootAnalysisProps {
  rootCause: string;
  originalThought: string;
}

interface AnalysisSections {
  understanding: string;
  reframe: string;
  wisdom: string;
  practical: string;
  affirmation: string;
}

export function RootAnalysis({ rootCause, originalThought }: RootAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisSections | null>(null);
  const [citations, setCitations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (analysis) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("root-analysis", {
        body: { rootCause, originalThought },
      });

      if (fnError) throw fnError;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        setCitations(data.citations || []);
        setIsExpanded(true);
      }
    } catch (err) {
      console.error("Failed to fetch root analysis:", err);
      setError("Unable to load analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sectionConfig = [
    {
      key: "understanding",
      title: "Understanding the Root",
      icon: Brain,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-500",
      borderColor: "border-violet-500/30",
    },
    {
      key: "reframe",
      title: "The Truth Reframe",
      icon: Lightbulb,
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/30",
    },
    {
      key: "wisdom",
      title: "Wisdom & Quotes",
      icon: Quote,
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/30",
    },
    {
      key: "practical",
      title: "Practical Steps",
      icon: Target,
      gradient: "from-sky-500/20 to-blue-500/20",
      iconColor: "text-sky-500",
      borderColor: "border-sky-500/30",
    },
    {
      key: "affirmation",
      title: "Your Affirmation",
      icon: Sparkles,
      gradient: "from-rose-500/20 to-pink-500/20",
      iconColor: "text-rose-500",
      borderColor: "border-rose-500/30",
      isHighlight: true,
    },
  ];

  return (
    <div className="mt-8 animate-fade-in">
      {/* Trigger Button */}
      <button
        onClick={fetchAnalysis}
        disabled={isLoading}
        className={cn(
          "w-full glass-card p-4 flex items-center justify-between gap-4 transition-all duration-300",
          "hover:bg-primary/5 group",
          isExpanded && "bg-primary/5"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Brain className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">Root Analysis</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Analyzing..." : "Dive deeper into understanding & healing"}
            </p>
          </div>
        </div>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-300",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && analysis && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {sectionConfig.map(({ key, title, icon: Icon, gradient, iconColor, borderColor, isHighlight }, index) => {
            const content = analysis[key as keyof AnalysisSections];
            if (!content) return null;

            return (
              <div
                key={key}
                className={cn(
                  "glass-card overflow-hidden transition-all duration-500",
                  isHighlight && "border-2",
                  borderColor
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Section Header */}
                <div className={cn("p-4 bg-gradient-to-r", gradient)}>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-5 h-5", iconColor)} />
                    <h4 className="font-medium text-foreground">{title}</h4>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-4">
                  {isHighlight ? (
                    <p className="text-lg font-display text-center text-foreground italic leading-relaxed">
                      "{content.replace(/^["']|["']$/g, '')}"
                    </p>
                  ) : (
                    <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                      {formatContent(content)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Sources */}
          {citations.length > 0 && (
            <div className="pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Sources & Further Reading
              </p>
              <div className="flex flex-wrap gap-2">
                {citations.slice(0, 4).map((url, i) => {
                  const domain = extractDomain(url);
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {domain}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Closing Message */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Remember: awareness is the first step to change. 
              <span className="text-foreground font-medium"> You're already on your way.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatContent(content: string): React.ReactNode {
  // Split by numbered items or bullet points
  const lines = content.split(/\n/).filter(line => line.trim());
  
  return lines.map((line, i) => {
    // Check if it's a numbered item
    const numberedMatch = line.match(/^(\d+)\.\s*(.*)$/);
    if (numberedMatch) {
      return (
        <div key={i} className="flex gap-3 mb-3 last:mb-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
            {numberedMatch[1]}
          </span>
          <span>{numberedMatch[2]}</span>
        </div>
      );
    }

    // Check if it's a quote (starts with ")
    if (line.trim().startsWith('"') || line.trim().startsWith('"')) {
      return (
        <blockquote key={i} className="border-l-2 border-primary/30 pl-4 my-3 italic text-foreground/80">
          {line}
        </blockquote>
      );
    }

    return <p key={i} className="mb-2 last:mb-0">{line}</p>;
  });
}

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url.slice(0, 30);
  }
}
