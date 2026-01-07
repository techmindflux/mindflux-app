import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MindConcept {
  id: string;
  title: string;
  subtitle: string;
  explanation: string;
  icon: string;
}

interface MindConceptCardProps {
  concept: MindConcept;
  onExplore: (concept: MindConcept) => void;
  index: number;
}

export function MindConceptCard({ concept, onExplore, index }: MindConceptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full text-left transition-all duration-300",
          "glass-card overflow-hidden",
          isExpanded ? "ring-1 ring-primary/20" : ""
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <span className="text-2xl">{concept.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              {concept.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {concept.subtitle}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
          />
        </div>

        {/* Expandable Content */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            isExpanded ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 pb-4 space-y-4">
            <div className="h-px bg-border/50" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {concept.explanation}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExplore(concept);
              }}
              className={cn(
                "w-full py-3 px-4 rounded-2xl",
                "bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10",
                "border border-primary/20",
                "flex items-center justify-center gap-2",
                "text-sm font-medium text-primary",
                "hover:from-primary/20 hover:via-accent/20 hover:to-primary/20",
                "transition-all duration-300 active:scale-[0.98]"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Explore this in me
            </button>
          </div>
        </div>
      </button>
    </div>
  );
}
