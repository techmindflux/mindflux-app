import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface StressCategory {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  shadowColor: string;
  textColor: string;
}

const stressCategories: StressCategory[] = [
  {
    id: "overwhelmed",
    title: "Overwhelmed",
    subtitle: "High tension, racing thoughts",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(244,63,94,0.5)]",
    textColor: "text-white",
  },
  {
    id: "activated",
    title: "Activated",
    subtitle: "Alert, productive pressure",
    gradient: "from-amber-400 via-yellow-400 to-orange-300",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(251,191,36,0.5)]",
    textColor: "text-amber-950",
  },
  {
    id: "drained",
    title: "Drained",
    subtitle: "Exhausted, low energy",
    gradient: "from-sky-400 via-blue-400 to-indigo-400",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(56,189,248,0.5)]",
    textColor: "text-white",
  },
  {
    id: "grounded",
    title: "Grounded",
    subtitle: "Calm, balanced, at ease",
    gradient: "from-emerald-400 via-green-400 to-teal-400",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(52,211,153,0.5)]",
    textColor: "text-emerald-950",
  },
];

export default function ManualCheckIn() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // TODO: Navigate to next step with selected category
    console.log("Selected category:", categoryId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-muted/10" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/check-in")}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Back"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="w-10" />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col px-6 pb-12">
        {/* Title */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-2xl font-display font-light text-foreground mb-2 italic">
            How does your stress feel right now?
          </h1>
          <p className="text-muted-foreground text-sm">
            Tap the one that resonates most
          </p>
        </div>

        {/* Category Grid */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
            {stressCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`
                  aspect-square rounded-full 
                  bg-gradient-to-br ${category.gradient}
                  ${category.shadowColor}
                  flex flex-col items-center justify-center
                  p-4 text-center
                  transition-all duration-300 ease-out
                  hover:scale-105 active:scale-95
                  animate-fade-in
                  ${selectedCategory === category.id ? "ring-4 ring-white/50 scale-105" : ""}
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <span className={`text-base font-medium ${category.textColor} mb-1`}>
                  {category.title}
                </span>
                <span className={`text-xs ${category.textColor} opacity-80 leading-tight px-2`}>
                  {category.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <p className="text-muted-foreground/60 text-xs">
            This helps us understand your current state
          </p>
        </div>
      </main>
    </div>
  );
}
