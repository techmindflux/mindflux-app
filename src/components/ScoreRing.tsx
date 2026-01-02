import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreRing({ score, maxScore = 100, size = "lg", className }: ScoreRingProps) {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getScoreColor = () => {
    if (percentage >= 80) return "stroke-score-excellent";
    if (percentage >= 60) return "stroke-score-good";
    if (percentage >= 40) return "stroke-score-fair";
    return "stroke-score-poor";
  };

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        className="w-full h-full -rotate-90 transform"
        viewBox="0 0 100 100"
      >
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/50"
        />
        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", getScoreColor())}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-semibold text-foreground", textSizeClasses[size])}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          / {maxScore}
        </span>
      </div>
    </div>
  );
}
