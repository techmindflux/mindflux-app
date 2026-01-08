import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Brain, ChevronRight } from "lucide-react";

interface RootAnalysisProps {
  rootCause: string;
  originalThought: string;
}

export function RootAnalysis({ rootCause, originalThought }: RootAnalysisProps) {
  const navigate = useNavigate();

  const handleClick = () => {
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

  return (
    <div className="mt-8 animate-fade-in">
      <button
        onClick={handleClick}
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
            <h3 className="font-medium text-foreground mb-1">Explore with Lumina</h3>
            <p className="text-sm text-muted-foreground">
              Dive deeper into this root cause with a guided conversation
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </button>
    </div>
  );
}
