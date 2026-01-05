import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight } from "lucide-react";

interface StressCategory {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  shadowColor: string;
  textColor: string;
  bubbleColor: string;
  bubbleTextColor: string;
  feelings: string[];
}

const stressCategories: StressCategory[] = [
  {
    id: "overwhelmed",
    title: "Overwhelmed",
    subtitle: "High tension, racing thoughts",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(244,63,94,0.5)]",
    textColor: "text-white",
    bubbleColor: "bg-gradient-to-br from-rose-400 to-red-500",
    bubbleTextColor: "text-white",
    feelings: [
      "Stressed", "Anxious", "Pressured", "Panicked", "Frazzled",
      "Tense", "Irritated", "Agitated", "Restless", "Nervous",
      "Worried", "On Edge", "Scattered", "Racing", "Hyper-vigilant"
    ],
  },
  {
    id: "activated",
    title: "Activated",
    subtitle: "Alert, productive pressure",
    gradient: "from-amber-400 via-yellow-400 to-orange-300",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(251,191,36,0.5)]",
    textColor: "text-amber-950",
    bubbleColor: "bg-gradient-to-br from-amber-300 to-yellow-400",
    bubbleTextColor: "text-amber-950",
    feelings: [
      "Focused", "Motivated", "Driven", "Energized", "Alert",
      "Determined", "Engaged", "Pumped", "Eager", "Challenged",
      "Ambitious", "Purposeful", "Ready", "Sharp", "In the Zone"
    ],
  },
  {
    id: "drained",
    title: "Drained",
    subtitle: "Exhausted, low energy",
    gradient: "from-sky-400 via-blue-400 to-indigo-400",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(56,189,248,0.5)]",
    textColor: "text-white",
    bubbleColor: "bg-gradient-to-br from-sky-400 to-blue-500",
    bubbleTextColor: "text-white",
    feelings: [
      "Exhausted", "Tired", "Burned Out", "Depleted", "Fatigued",
      "Unmotivated", "Foggy", "Heavy", "Numb", "Empty",
      "Discouraged", "Spent", "Overwhelmed", "Flat", "Weary"
    ],
  },
  {
    id: "grounded",
    title: "Grounded",
    subtitle: "Calm, balanced, at ease",
    gradient: "from-emerald-400 via-green-400 to-teal-400",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(52,211,153,0.5)]",
    textColor: "text-emerald-950",
    bubbleColor: "bg-gradient-to-br from-emerald-400 to-green-500",
    bubbleTextColor: "text-emerald-950",
    feelings: [
      "Calm", "Peaceful", "Relaxed", "Balanced", "Content",
      "At Ease", "Centered", "Comfortable", "Steady", "Grateful",
      "Present", "Mellow", "Tranquil", "Composed", "Rested"
    ],
  },
];

export default function ManualCheckIn() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState<"category" | "feeling">("category");
  const [selectedCategory, setSelectedCategory] = useState<StressCategory | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleCategorySelect = (category: StressCategory) => {
    setSelectedCategory(category);
    setStep("feeling");
  };

  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling);
  };

  const handleBack = () => {
    if (step === "feeling") {
      setStep("category");
      setSelectedFeeling(null);
    } else {
      navigate("/check-in");
    }
  };

  const handleContinue = () => {
    if (selectedFeeling && selectedCategory) {
      // TODO: Navigate to next step (intensity slider or save)
      console.log("Selected:", selectedCategory.id, selectedFeeling);
    }
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
          onClick={handleBack}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Back"
        >
          {step === "feeling" ? (
            <ArrowLeft className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>

        <div className="w-10" />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col px-6 pb-6 overflow-hidden">
        {step === "category" ? (
          <>
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
                    onClick={() => handleCategorySelect(category)}
                    className={`
                      aspect-square rounded-full 
                      bg-gradient-to-br ${category.gradient}
                      ${category.shadowColor}
                      flex flex-col items-center justify-center
                      p-4 text-center
                      transition-all duration-300 ease-out
                      hover:scale-105 active:scale-95
                      animate-fade-in
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
          </>
        ) : selectedCategory && (
          <>
            {/* Title */}
            <div className="text-center mb-6 animate-fade-in">
              <h1 className="text-2xl font-display font-light text-foreground mb-2 italic">
                What best describes your {selectedCategory.title.toLowerCase()} feeling?
              </h1>
              <p className="text-muted-foreground text-sm">
                Tap the emotion that resonates most
              </p>
            </div>

            {/* Feelings Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto pb-24 -mx-2 px-2">
              <div className="grid grid-cols-3 gap-3">
                {selectedCategory.feelings.map((feeling, index) => (
                  <button
                    key={feeling}
                    onClick={() => handleFeelingSelect(feeling)}
                    className={`
                      aspect-square rounded-full 
                      ${selectedCategory.bubbleColor}
                      flex items-center justify-center
                      p-2 text-center
                      transition-all duration-300 ease-out
                      hover:scale-105 active:scale-95
                      animate-fade-in
                      ${selectedFeeling === feeling 
                        ? "ring-4 ring-white/60 scale-105 shadow-lg" 
                        : "shadow-md"
                      }
                    `}
                    style={{
                      animationDelay: `${index * 30}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <span className={`text-sm font-medium ${selectedCategory.bubbleTextColor} leading-tight`}>
                      {feeling}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div 
              className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-center gap-4 max-w-sm mx-auto">
                <div className="flex-1 bg-muted/80 backdrop-blur-sm rounded-full px-5 py-4">
                  {selectedFeeling ? (
                    <div>
                      <p className="text-foreground font-medium text-sm">{selectedFeeling}</p>
                      <p className="text-muted-foreground text-xs">
                        feeling {selectedCategory.title.toLowerCase()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Select an emotion above
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleContinue}
                  disabled={!selectedFeeling}
                  size="icon"
                  className={`
                    w-14 h-14 rounded-full transition-all duration-300
                    ${selectedFeeling 
                      ? "bg-foreground text-background hover:bg-foreground/90" 
                      : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
