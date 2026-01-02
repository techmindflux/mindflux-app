import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function GlassCard({ children, className, onClick, hoverable = false }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card p-5",
        hoverable && "cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}
