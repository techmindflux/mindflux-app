import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BreathingLoaderProps {
  className?: string;
}

export function BreathingLoader({ className }: BreathingLoaderProps) {
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    const phases = [
      { phase: "in" as const, duration: 4000 },
      { phase: "hold" as const, duration: 2000 },
      { phase: "out" as const, duration: 4000 },
    ];

    let currentPhaseIndex = 0;

    const runPhase = () => {
      const { phase, duration } = phases[currentPhaseIndex];
      setBreathPhase(phase);
      
      if (phase === "in") {
        setCycleCount((prev) => prev + 1);
      }

      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      return setTimeout(runPhase, duration);
    };

    const timeout = runPhase();
    return () => clearTimeout(timeout);
  }, []);

  const breathText = {
    in: "Breathe in...",
    hold: "Hold...",
    out: "Breathe out...",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-16", className)}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div 
          className={cn(
            "absolute w-[500px] h-[500px] rounded-full transition-all duration-[4000ms] ease-in-out blur-3xl",
            breathPhase === "in" && "scale-110 opacity-30",
            breathPhase === "hold" && "scale-110 opacity-35",
            breathPhase === "out" && "scale-90 opacity-20"
          )}
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main breathing circle container */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer ripple rings */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute rounded-full border transition-all ease-in-out",
              breathPhase === "in" && "scale-100 opacity-100",
              breathPhase === "hold" && "scale-100 opacity-80",
              breathPhase === "out" && "scale-75 opacity-40"
            )}
            style={{
              width: `${180 + i * 40}px`,
              height: `${180 + i * 40}px`,
              borderColor: `hsl(var(--primary) / ${0.15 - i * 0.04})`,
              transitionDuration: `${4000 + i * 200}ms`,
              transitionDelay: `${i * 100}ms`,
            }}
          />
        ))}

        {/* Inner glow layer */}
        <div
          className={cn(
            "absolute w-32 h-32 rounded-full transition-all duration-[4000ms] ease-in-out",
            breathPhase === "in" && "scale-125 opacity-60",
            breathPhase === "hold" && "scale-125 opacity-70",
            breathPhase === "out" && "scale-90 opacity-40"
          )}
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, hsl(var(--primary) / 0.1) 50%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />

        {/* Main breathing orb */}
        <div
          className={cn(
            "relative w-24 h-24 rounded-full transition-all duration-[4000ms] ease-in-out shadow-2xl",
            breathPhase === "in" && "scale-110",
            breathPhase === "hold" && "scale-110",
            breathPhase === "out" && "scale-90"
          )}
          style={{
            background: `
              radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.9) 0%, hsl(var(--primary) / 0.6) 40%, hsl(var(--primary) / 0.4) 100%)
            `,
            boxShadow: `
              0 0 40px hsl(var(--primary) / 0.3),
              0 0 80px hsl(var(--primary) / 0.2),
              inset 0 0 20px hsl(var(--primary-foreground) / 0.1)
            `,
          }}
        >
          {/* Highlight reflection */}
          <div
            className="absolute top-3 left-4 w-8 h-5 rounded-full opacity-40"
            style={{
              background: "linear-gradient(180deg, hsl(var(--primary-foreground) / 0.6) 0%, transparent 100%)",
              filter: "blur(4px)",
            }}
          />
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className={cn(
              "absolute w-1.5 h-1.5 rounded-full bg-primary/40 transition-all duration-[4000ms] ease-in-out"
            )}
            style={{
              transform: `rotate(${i * 60}deg) translateY(${breathPhase === "in" || breathPhase === "hold" ? -70 : -50}px)`,
              opacity: breathPhase === "out" ? 0.2 : 0.6,
              transitionDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>

      {/* Breath instruction text */}
      <div className="mt-12 text-center">
        <p 
          className="text-xl font-display text-foreground/80 transition-opacity duration-500"
          key={breathPhase}
        >
          {breathText[breathPhase]}
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          Finding the roots of your thought
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mt-8 flex items-center gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-500",
              i < cycleCount % 4 ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Subtle instruction */}
      <p className="text-xs text-muted-foreground/60 mt-6 max-w-[200px] text-center">
        Take a moment to breathe while we explore your thought patterns
      </p>
    </div>
  );
}
