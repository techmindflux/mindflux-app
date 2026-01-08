import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InsightsLoaderProps {
  className?: string;
  message?: string;
}

export function InsightsLoader({ className, message = "Gathering insights..." }: InsightsLoaderProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const phases = [
    "Exploring knowledge...",
    "Connecting ideas...",
    "Curating resources...",
  ];

  return (
    <div className={cn("flex flex-col items-center justify-center py-20", className)}>
      {/* Ambient gradient background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, hsl(var(--accent) / 0.3) 50%, transparent 70%)",
            animationDuration: "3s",
          }}
        />
      </div>

      {/* Main container */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Outer rotating ring */}
        <div 
          className="absolute w-40 h-40 rounded-full border border-primary/20"
          style={{
            animation: "spin 8s linear infinite",
          }}
        >
          {/* Gradient arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <defs>
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="80"
              cy="80"
              r="78"
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth="2"
              strokeDasharray="120 400"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Middle pulsing ring */}
        <div 
          className="absolute w-28 h-28 rounded-full border border-primary/30"
          style={{
            animation: "pulse 2s ease-in-out infinite",
          }}
        />

        {/* Inner glowing core */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Glow effect */}
          <div 
            className="absolute w-full h-full rounded-full opacity-60"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
              filter: "blur(12px)",
              animation: "breathe 3s ease-in-out infinite",
            }}
          />
          
          {/* Core orb */}
          <div 
            className="relative w-14 h-14 rounded-full shadow-glow"
            style={{
              background: `
                radial-gradient(circle at 35% 35%, 
                  hsl(var(--primary-foreground) / 0.2) 0%, 
                  hsl(var(--primary)) 30%, 
                  hsl(var(--primary) / 0.8) 100%
                )
              `,
              boxShadow: `
                0 0 30px hsl(var(--primary) / 0.4),
                0 0 60px hsl(var(--primary) / 0.2),
                inset 0 -8px 20px hsl(var(--primary) / 0.3)
              `,
              animation: "float 4s ease-in-out infinite",
            }}
          >
            {/* Specular highlight */}
            <div 
              className="absolute top-2 left-3 w-6 h-4 rounded-full"
              style={{
                background: "linear-gradient(180deg, hsl(var(--primary-foreground) / 0.5) 0%, transparent 100%)",
                filter: "blur(3px)",
              }}
            />
          </div>
        </div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/60"
            style={{
              animation: `orbit ${6 + i}s linear infinite`,
              animationDelay: `${i * -2}s`,
              transformOrigin: "80px 80px",
              left: "calc(50% - 4px)",
              top: "calc(50% - 80px)",
            }}
          />
        ))}
      </div>

      {/* Text content */}
      <div className="mt-10 text-center relative z-10">
        <p 
          className="text-lg font-display text-foreground/90 transition-all duration-700 ease-out"
          key={phase}
          style={{
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          {phases[phase]}
        </p>
        <p className="text-sm text-muted-foreground mt-2 opacity-70">
          {message}
        </p>
      </div>

      {/* Progress wave */}
      <div className="mt-8 flex items-center gap-1.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary/40 rounded-full"
            style={{
              height: "16px",
              animation: "soundWave 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateY(0); }
          to { transform: rotate(360deg) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
