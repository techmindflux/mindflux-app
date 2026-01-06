import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Plus, PenLine, Camera, Mic } from "lucide-react";

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

const contextOptions = {
  activities: ["Working", "Eating", "Resting", "Commuting", "Exercising", "Socializing"],
  companions: ["By Myself", "Friends", "Family", "Co-Workers", "Partner", "Pets"],
  locations: ["Home", "Work", "School", "Outside", "Commuting", "Gym"],
};

export default function ManualCheckIn() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState<"category" | "feeling" | "context">("category");
  const [selectedCategory, setSelectedCategory] = useState<StressCategory | null>(null);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleCategorySelect = (category: StressCategory) => {
    setSelectedCategory(category);
    setStep("feeling");
  };

  const toggleFeeling = (feeling: string) => {
    setSelectedFeelings((prev) =>
      prev.includes(feeling)
        ? prev.filter((f) => f !== feeling)
        : [...prev, feeling]
    );
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const toggleCompanion = (companion: string) => {
    setSelectedCompanions((prev) =>
      prev.includes(companion)
        ? prev.filter((c) => c !== companion)
        : [...prev, companion]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleBack = () => {
    if (step === "context") {
      setStep("feeling");
    } else if (step === "feeling") {
      setStep("category");
      setSelectedFeelings([]);
    } else {
      navigate("/check-in");
    }
  };

  const handleContinue = () => {
    if (selectedFeelings.length > 0 && selectedCategory) {
      setStep("context");
    }
  };

  const handleCompleteCheckIn = () => {
    // Navigate to coaching session with check-in data
    navigate("/coaching-session", {
      state: {
        category: selectedCategory?.id,
        feelings: selectedFeelings,
      },
    });
  };

  const getCategoryGradientStyle = () => {
    if (!selectedCategory) return {};
    
    const gradientMap: Record<string, string> = {
      overwhelmed: "linear-gradient(135deg, #f43f5e, #f97316)",
      activated: "linear-gradient(135deg, #fbbf24, #fb923c)",
      drained: "linear-gradient(135deg, #38bdf8, #6366f1)",
      grounded: "linear-gradient(135deg, #34d399, #14b8a6)",
    };
    
    return { background: gradientMap[selectedCategory.id] || gradientMap.overwhelmed };
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
          {step !== "category" ? (
            <ArrowLeft className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>

        {/* Mini category icon in context step */}
        {step === "context" && selectedCategory && (
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={getCategoryGradientStyle()}
          >
            <div className="w-6 h-6 bg-white/30 rounded" />
          </div>
        )}

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
        ) : step === "feeling" && selectedCategory ? (
          <>
            {/* Title */}
            <div className="text-center mb-6 animate-fade-in">
              <h1 className="text-2xl font-display font-light text-foreground mb-2 italic">
                What best describes your {selectedCategory.title.toLowerCase()} feeling?
              </h1>
              <p className="text-muted-foreground text-sm">
                Select all that apply
              </p>
            </div>

            {/* Feelings Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto pb-24 -mx-2 px-2">
              <div className="grid grid-cols-3 gap-3">
                {selectedCategory.feelings.map((feeling, index) => {
                  const isSelected = selectedFeelings.includes(feeling);
                  return (
                    <button
                      key={feeling}
                      onClick={() => toggleFeeling(feeling)}
                      className={`
                        aspect-square rounded-full 
                        ${selectedCategory.bubbleColor}
                        flex items-center justify-center
                        p-2 text-center
                        transition-all duration-300 ease-out
                        hover:scale-105 active:scale-95
                        animate-fade-in
                        ${isSelected 
                          ? "ring-4 ring-white/60 scale-105 shadow-lg" 
                          : "shadow-md opacity-80 hover:opacity-100"
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
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div 
              className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-center gap-4 max-w-sm mx-auto">
                <div className="flex-1 bg-muted/80 backdrop-blur-sm rounded-full px-5 py-4">
                  {selectedFeelings.length > 0 ? (
                    <div>
                      <p className="text-foreground font-medium text-sm">
                        {selectedFeelings.length === 1 
                          ? selectedFeelings[0] 
                          : `${selectedFeelings.length} feelings selected`
                        }
                      </p>
                      <p className="text-muted-foreground text-xs">
                        feeling {selectedCategory.title.toLowerCase()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Select emotions above
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleContinue}
                  disabled={selectedFeelings.length === 0}
                  size="icon"
                  className={`
                    w-14 h-14 rounded-full transition-all duration-300
                    ${selectedFeelings.length > 0 
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
        ) : step === "context" && selectedCategory && (
          <>
            {/* Feelings Summary */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl font-display font-light text-foreground mb-1 italic">
                I'm feeling
              </h1>
              <p 
                className="text-2xl font-display font-medium italic"
                style={{ color: selectedCategory.id === "overwhelmed" ? "#f43f5e" 
                  : selectedCategory.id === "activated" ? "#fbbf24"
                  : selectedCategory.id === "drained" ? "#38bdf8"
                  : "#34d399" 
                }}
              >
                {selectedFeelings.join(", ").toLowerCase()}
              </p>
            </div>

            {/* Add Journal Entry Card */}
            <div className="mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="bg-muted/60 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
                <span className="text-foreground/80 text-sm">Add Journal Entry</span>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <PenLine className="h-4 w-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Context Options */}
            <div className="flex-1 overflow-y-auto pb-28 space-y-6">
              {/* What are you doing? */}
              <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
                <h3 className="text-foreground/80 text-lg mb-3">What are you doing?</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                  {contextOptions.activities.map((activity) => {
                    const isSelected = selectedActivities.includes(activity);
                    return (
                      <button
                        key={activity}
                        onClick={() => toggleActivity(activity)}
                        className={`
                          px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                          ${isSelected 
                            ? "bg-foreground text-background" 
                            : "bg-muted/60 text-foreground/80 hover:bg-muted"
                          }
                        `}
                      >
                        {activity}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Who are you with? */}
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <h3 className="text-foreground/80 text-lg mb-3">Who are you with?</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                  {contextOptions.companions.map((companion) => {
                    const isSelected = selectedCompanions.includes(companion);
                    return (
                      <button
                        key={companion}
                        onClick={() => toggleCompanion(companion)}
                        className={`
                          px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                          ${isSelected 
                            ? "bg-foreground text-background" 
                            : "bg-muted/60 text-foreground/80 hover:bg-muted"
                          }
                        `}
                      >
                        {companion}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Where are you? */}
              <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
                <h3 className="text-foreground/80 text-lg mb-3">Where are you?</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                  {contextOptions.locations.map((location) => {
                    const isSelected = selectedLocations.includes(location);
                    return (
                      <button
                        key={location}
                        onClick={() => toggleLocation(location)}
                        className={`
                          px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                          ${isSelected 
                            ? "bg-foreground text-background" 
                            : "bg-muted/60 text-foreground/80 hover:bg-muted"
                          }
                        `}
                      >
                        {location}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div 
              className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center gap-3 max-w-sm mx-auto">
                <Button
                  onClick={handleCompleteCheckIn}
                  className="flex-1 h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 text-base font-medium"
                >
                  Complete check-in
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
