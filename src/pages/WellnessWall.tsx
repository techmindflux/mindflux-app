import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { X, Play, BookOpen, Music, Dumbbell, Wind, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  type: "meditation" | "breathing" | "motivation" | "education" | "exercise" | "music";
}

interface CheckInData {
  category: string;
  feelings: string[];
}

const typeConfig: Record<string, { icon: React.ElementType; gradient: string; label: string }> = {
  meditation: { icon: Sparkles, gradient: "from-violet-500 to-purple-600", label: "Meditation" },
  breathing: { icon: Wind, gradient: "from-sky-400 to-cyan-500", label: "Breathing" },
  motivation: { icon: Play, gradient: "from-amber-400 to-orange-500", label: "Motivation" },
  education: { icon: BookOpen, gradient: "from-emerald-400 to-teal-500", label: "Education" },
  exercise: { icon: Dumbbell, gradient: "from-rose-400 to-pink-500", label: "Exercise" },
  music: { icon: Music, gradient: "from-indigo-400 to-blue-500", label: "Music" },
};

export default function WellnessWall() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkInData = location.state as CheckInData | null;

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!checkInData) {
        setError("No check-in data found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error: fnError } = await supabase.functions.invoke("wellness-recommendations", {
          body: {
            feelings: checkInData.feelings,
            category: checkInData.category,
          },
        });

        if (fnError) throw fnError;

        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [checkInData]);

  const handleOpenVideo = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getCategoryColor = () => {
    switch (checkInData?.category) {
      case "overwhelmed": return "text-rose-400";
      case "activated": return "text-amber-400";
      case "drained": return "text-sky-400";
      case "grounded": return "text-emerald-400";
      default: return "text-primary";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      {/* Decorative elements */}
      <div className="fixed top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="w-10" />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col px-6 pb-8 overflow-hidden">
        {/* Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-display font-light text-foreground mb-2 italic">
            Your Wellness Wall
          </h1>
          {checkInData && (
            <p className="text-muted-foreground text-sm">
              Curated for feeling{" "}
              <span className={getCategoryColor()}>
                {checkInData.feelings.join(", ").toLowerCase()}
              </span>
            </p>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Finding the perfect content for you...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate("/check-in")} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Recommendations Grid */}
        {!isLoading && !error && (
          <div className="flex-1 overflow-y-auto pb-4 -mx-2 px-2">
            <div className="grid grid-cols-2 gap-4">
              {recommendations.map((rec, index) => {
                const config = typeConfig[rec.type] || typeConfig.meditation;
                const IconComponent = config.icon;
                
                return (
                  <button
                    key={rec.id}
                    onClick={() => handleOpenVideo(rec.youtubeUrl)}
                    className={`
                      group relative overflow-hidden rounded-2xl p-4 text-left
                      bg-gradient-to-br ${config.gradient}
                      shadow-lg hover:shadow-xl
                      transition-all duration-300 ease-out
                      hover:scale-[1.02] active:scale-[0.98]
                      animate-fade-in
                    `}
                    style={{
                      animationDelay: `${index * 80}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/20" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-white/10" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full min-h-[140px]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-xs text-white/70 mb-1 uppercase tracking-wide">
                          {config.label}
                        </p>
                        <h3 className="text-white font-medium text-sm leading-tight mb-2 line-clamp-2">
                          {rec.title}
                        </h3>
                        <p className="text-white/70 text-xs leading-snug line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom action */}
        <div className="mt-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <Button
            onClick={() => navigate("/")}
            className="w-full h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium"
          >
            Done
          </Button>
        </div>
      </main>
    </div>
  );
}
