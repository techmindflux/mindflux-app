import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, ChevronDown } from "lucide-react";

interface ThoughtNode {
  id: string;
  text: string;
  level: number;
  isRoot?: boolean;
}

interface ThoughtTreeProps {
  originalThought: string;
  nodes: ThoughtNode[];
  rootCause: string | null;
  isLoading?: boolean;
  onReset?: () => void;
}

export function ThoughtTree({ originalThought, nodes, rootCause, isLoading, onReset }: ThoughtTreeProps) {
  const [visibleNodes, setVisibleNodes] = useState<number>(0);
  const [showRootCause, setShowRootCause] = useState(false);

  // Animate nodes appearing one by one
  useEffect(() => {
    if (nodes.length === 0) return;

    const timer = setInterval(() => {
      setVisibleNodes((prev) => {
        if (prev >= nodes.length) {
          clearInterval(timer);
          // Show root cause after all nodes are visible
          setTimeout(() => setShowRootCause(true), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(timer);
  }, [nodes.length]);

  // Group nodes by level
  const levels = nodes.reduce((acc, node) => {
    if (!acc[node.level]) acc[node.level] = [];
    acc[node.level].push(node);
    return acc;
  }, {} as Record<number, ThoughtNode[]>);

  const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);

  const getNodeIndex = (level: number, indexInLevel: number): number => {
    let count = 0;
    for (let l = 0; l < level; l++) {
      count += levels[l]?.length || 0;
    }
    return count + indexInLevel;
  };

  return (
    <div className="relative max-w-2xl mx-auto pt-6">
      {/* Original Thought - Top of tree */}
      <div className="relative mb-8 animate-scale-in pt-4">
        <div className="relative glass-card p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 overflow-visible">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-medium uppercase tracking-wider rounded-full z-10">
            Your Thought
          </div>
          <p className="text-center text-foreground font-medium leading-relaxed pt-2">
            "{originalThought}"
          </p>
        </div>

        {/* Connector line down */}
        {nodes.length > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-8 bg-gradient-to-b from-primary/40 to-border" />
        )}
      </div>

      {/* Tree Nodes */}
      <div className="relative space-y-6">
        {levelKeys.map((level) => {
          const levelNodes = levels[level];
          
          return (
            <div key={level} className="relative">
              {/* Level indicator */}
              {level > 0 && (
                <div className="flex justify-center mb-3">
                  <ChevronDown className="w-4 h-4 text-muted-foreground/40 animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
              )}

              {/* Nodes at this level */}
              <div className={cn(
                "grid gap-3",
                levelNodes.length === 1 ? "grid-cols-1 max-w-md mx-auto" :
                levelNodes.length === 2 ? "grid-cols-2" : "grid-cols-1"
              )}>
                {levelNodes.map((node, indexInLevel) => {
                  const nodeIndex = getNodeIndex(level, indexInLevel);
                  const isVisible = nodeIndex < visibleNodes;

                  return (
                    <div
                      key={node.id}
                      className={cn(
                        "transition-all duration-500",
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      )}
                      style={{ transitionDelay: `${indexInLevel * 100}ms` }}
                    >
                      <div className={cn(
                        "relative p-4 rounded-2xl border transition-all duration-300",
                        level === 0 
                          ? "bg-card border-border/50" 
                          : level === 1 
                          ? "bg-secondary/30 border-secondary/50"
                          : "bg-muted/30 border-muted/50"
                      )}>
                        {/* Level badge */}
                        <div className={cn(
                          "absolute -top-2 left-4 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider rounded-full",
                          level === 0 
                            ? "bg-foreground/10 text-foreground/60"
                            : level === 1
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}>
                          Layer {level + 1}
                        </div>

                        <p className="text-sm text-foreground/90 leading-relaxed pt-1">
                          {node.text}
                        </p>

                        {/* Connector dots */}
                        {isVisible && level < levelKeys[levelKeys.length - 1] && (
                          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <div className="w-1 h-1 rounded-full bg-border/60" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Root Cause - Bottom of tree */}
      {showRootCause && rootCause && (
        <div className="relative mt-10 pt-4 animate-scale-in">
          {/* Connector */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 h-6 bg-gradient-to-b from-border to-amber-500/40" />
          
          {/* Root indicator */}
          <div className="flex justify-center mb-6 mt-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse-soft">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Root cause card */}
          <div className="relative pt-4">
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-lg z-10">
              Root Cause
            </div>
            <div className="glass-card p-6 pt-8 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border-amber-500/30 overflow-visible">
              <p className="text-center text-foreground font-medium leading-relaxed text-lg">
                {rootCause}
              </p>
            </div>
          </div>

          {/* Insight section */}
          <div className="mt-6 p-4 rounded-xl bg-card/50 border border-border/30">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Understanding this root helps you see your thought isn't a truth—it's a pattern. 
              <span className="text-foreground font-medium"> You can observe it without being defined by it.</span>
            </p>
          </div>
        </div>
      )}

      {/* Reset button */}
      {onReset && (showRootCause || isLoading) && (
        <div className="flex justify-center mt-8 mb-24">
          <button
            onClick={onReset}
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Start over with a new thought
          </button>
        </div>
      )}
    </div>
  );
}
