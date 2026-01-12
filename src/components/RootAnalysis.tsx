import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Brain, ChevronRight, BookOpen } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface RootAnalysisProps {
  rootCause: string;
  originalThought: string;
}

export function RootAnalysis({ rootCause, originalThought }: RootAnalysisProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleLuminaClick = () => {
    // Navigate to Lumina with root cause context
    navigate("/lumina", {
      state: {
        rootAnalysis: {
          rootCause,
          originalThought,
        },
      },
    });
  };

  const handleJournalClick = () => {
    // Navigate to Journal with thought and root cause
    navigate("/journal", {
      state: {
        thought: originalThought,
        rootCause,
      },
    });
  };

  return (
    <div className="mt-8 space-y-3 animate-fade-in">
      {/* Explore with Lumina Button */}
      <button
        onClick={handleLuminaClick}
        className={cn(
          "w-full glass-card p-5 flex items-center justify-between gap-4 transition-all duration-300",
          "hover:bg-primary/5 hover:border-primary/30 group"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground mb-1">
              {language === "hi" ? "लुमिना के साथ एक्सप्लोर करें" : "Explore with Lumina"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "hi" 
                ? "इस मूल कारण पर गहरी बातचीत करें" 
                : "Dive deeper into this root cause with a guided conversation"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </button>

      {/* Journal This Button */}
      <button
        onClick={handleJournalClick}
        className={cn(
          "w-full glass-card p-5 flex items-center justify-between gap-4 transition-all duration-300",
          "hover:bg-accent/10 hover:border-accent/40 group"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground mb-1">
              {language === "hi" ? "मैं इसे जर्नल करना चाहता हूं" : "I want to Journal this"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "hi" 
                ? "अपने विचारों और भावनाओं को लिखकर व्यक्त करें" 
                : "Express your thoughts and feelings through writing"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
      </button>
    </div>
  );
}
