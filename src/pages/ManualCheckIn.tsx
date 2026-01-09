import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Plus, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";

interface ThoughtCategory {
  id: string;
  titleKey: keyof ReturnType<typeof import("@/hooks/useLanguage").useLanguage>["t"];
  subtitleKey: keyof ReturnType<typeof import("@/hooks/useLanguage").useLanguage>["t"];
  gradient: string;
  shadowColor: string;
  textColor: string;
  bubbleColor: string;
  bubbleTextColor: string;
  thoughtKeys: (keyof ReturnType<typeof import("@/hooks/useLanguage").useLanguage>["t"])[];
}

const thoughtCategories: ThoughtCategory[] = [
  {
    id: "ruminating",
    titleKey: "ruminating",
    subtitleKey: "ruminatingDesc",
    gradient: "from-violet-500 via-purple-500 to-indigo-500",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(139,92,246,0.5)]",
    textColor: "text-white",
    bubbleColor: "bg-gradient-to-br from-violet-400 to-purple-500",
    bubbleTextColor: "text-white",
    thoughtKeys: [
      "replaying", "regretting", "dwelling", "looping", "rehashing",
      "overanalyzing", "wishing", "blaming", "secondGuessing", "fixating",
      "brooding", "mulling", "obsessing", "haunted", "stuck"
    ],
  },
  {
    id: "anxious",
    titleKey: "anxious",
    subtitleKey: "anxiousDesc",
    gradient: "from-amber-400 via-orange-400 to-rose-400",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(251,146,60,0.5)]",
    textColor: "text-white",
    bubbleColor: "bg-gradient-to-br from-amber-400 to-orange-500",
    bubbleTextColor: "text-white",
    thoughtKeys: [
      "worrying", "catastrophizing", "whatIfs", "spiraling", "overthinking",
      "fearing", "anticipating", "dreading", "racing", "scattered",
      "restless", "panicking", "hypervigilant", "projecting", "doomScrolling"
    ],
  },
  {
    id: "critical",
    titleKey: "critical",
    subtitleKey: "criticalDesc",
    gradient: "from-rose-500 via-red-500 to-pink-500",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(244,63,94,0.5)]",
    textColor: "text-white",
    bubbleColor: "bg-gradient-to-br from-rose-400 to-red-500",
    bubbleTextColor: "text-white",
    thoughtKeys: [
      "judging", "comparing", "criticizing", "doubting", "shaming",
      "notEnough", "failing", "imposter", "perfectionist", "selfAttacking",
      "belittling", "harsh", "unworthy", "dismissive", "inadequate"
    ],
  },
  {
    id: "clear",
    titleKey: "clear",
    subtitleKey: "clearDesc",
    gradient: "from-emerald-400 via-teal-400 to-cyan-400",
    shadowColor: "shadow-[0_8px_40px_-8px_rgba(52,211,153,0.5)]",
    textColor: "text-emerald-950",
    bubbleColor: "bg-gradient-to-br from-emerald-400 to-teal-500",
    bubbleTextColor: "text-emerald-950",
    thoughtKeys: [
      "present", "calm", "focused", "grounded", "peaceful",
      "accepting", "curious", "open", "grateful", "hopeful",
      "content", "balanced", "centered", "flowing", "aware"
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
  const { isAuthenticated, isLoading, authType, user } = useAuth();
  const { t, language } = useLanguage();
  
  const [step, setStep] = useState<"category" | "feeling" | "context">("category");
  const [selectedCategory, setSelectedCategory] = useState<ThoughtCategory | null>(null);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  // Custom context options
  const [customActivities, setCustomActivities] = useState<string[]>([]);
  const [customCompanions, setCustomCompanions] = useState<string[]>([]);
  const [customLocations, setCustomLocations] = useState<string[]>([]);
  
  // Add custom input states
  const [addingActivity, setAddingActivity] = useState(false);
  const [addingCompanion, setAddingCompanion] = useState(false);
  const [addingLocation, setAddingLocation] = useState(false);
  const [newActivity, setNewActivity] = useState("");
  const [newCompanion, setNewCompanion] = useState("");
  const [newLocation, setNewLocation] = useState("");
  
  // Journal entry states
  const [feelingIntensity, setFeelingIntensity] = useState(50);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [promptResponses, setPromptResponses] = useState<Record<string, string>>({});
  const [isJournalExpanded, setIsJournalExpanded] = useState(false);
  const [freeformNote, setFreeformNote] = useState("");

  const reflectionPrompts = [
    { id: "trigger", label: t.whatTriggered, icon: "⚡" },
    { id: "body", label: t.whereInBody, icon: "🫀" },
    { id: "need", label: t.whatDoYouNeed, icon: "🌱" },
    { id: "pattern", label: t.familiarPattern, icon: "🔄" },
  ];
  
  // Handlers for adding custom options
  const handleAddActivity = () => {
    if (newActivity.trim() && !customActivities.includes(newActivity.trim()) && !contextOptions.activities.includes(newActivity.trim())) {
      setCustomActivities(prev => [...prev, newActivity.trim()]);
      setSelectedActivities(prev => [...prev, newActivity.trim()]);
      setNewActivity("");
    }
    setAddingActivity(false);
  };
  
  const handleAddCompanion = () => {
    if (newCompanion.trim() && !customCompanions.includes(newCompanion.trim()) && !contextOptions.companions.includes(newCompanion.trim())) {
      setCustomCompanions(prev => [...prev, newCompanion.trim()]);
      setSelectedCompanions(prev => [...prev, newCompanion.trim()]);
      setNewCompanion("");
    }
    setAddingCompanion(false);
  };
  
  const handleAddLocation = () => {
    if (newLocation.trim() && !customLocations.includes(newLocation.trim()) && !contextOptions.locations.includes(newLocation.trim())) {
      setCustomLocations(prev => [...prev, newLocation.trim()]);
      setSelectedLocations(prev => [...prev, newLocation.trim()]);
      setNewLocation("");
    }
    setAddingLocation(false);
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleCategorySelect = (category: ThoughtCategory) => {
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

  const togglePrompt = (promptId: string) => {
    setSelectedPrompts((prev) =>
      prev.includes(promptId)
        ? prev.filter((p) => p !== promptId)
        : [...prev, promptId]
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
      navigate("/home");
    }
  };

  const handleContinue = () => {
    if (selectedFeelings.length > 0 && selectedCategory) {
      setStep("context");
    }
  };

  const getIntensityLabel = () => {
    if (feelingIntensity < 25) return t.mild;
    if (feelingIntensity < 50) return t.moderate;
    if (feelingIntensity < 75) return t.strong;
    return t.intense;
  };

  const getIntensityColor = () => {
    if (!selectedCategory) return "#888";
    const colors: Record<string, string[]> = {
      overwhelmed: ["#fda4af", "#f43f5e", "#e11d48", "#be123c"],
      activated: ["#fde68a", "#fbbf24", "#f59e0b", "#d97706"],
      drained: ["#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7"],
      grounded: ["#86efac", "#34d399", "#10b981", "#059669"],
    };
    const palette = colors[selectedCategory.id] || colors.overwhelmed;
    if (feelingIntensity < 25) return palette[0];
    if (feelingIntensity < 50) return palette[1];
    if (feelingIntensity < 75) return palette[2];
    return palette[3];
  };

  const handleCompleteCheckIn = async () => {
    // Save check-in to database for Google users
    if (authType === "google" && user?.id && selectedCategory) {
      try {
        await supabase.from("stress_checkins").insert({
          user_id: user.id,
          category: selectedCategory.id,
          feelings: selectedFeelings,
          intensity: feelingIntensity,
          activities: selectedActivities,
          companions: selectedCompanions,
          locations: selectedLocations,
          journal_prompts: promptResponses,
          freeform_note: freeformNote || null,
        });
      } catch (error) {
        console.error("Failed to save check-in:", error);
      }
    }

    // Navigate to coaching session with all check-in data
    navigate("/coaching-session", {
      state: {
        category: selectedCategory?.id,
        feelings: selectedFeelings,
        intensity: feelingIntensity,
        intensityLabel: getIntensityLabel(),
        activities: selectedActivities,
        companions: selectedCompanions,
        locations: selectedLocations,
        journalPrompts: promptResponses,
        freeformNote: freeformNote,
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
                {t.natureOfThoughts}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t.tapResonates}
              </p>
            </div>

            {/* Category Grid */}
            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
                {thoughtCategories.map((category, index) => (
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
                      {t[category.titleKey]}
                    </span>
                    <span className={`text-xs ${category.textColor} opacity-80 leading-tight px-2`}>
                      {t[category.subtitleKey]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom hint */}
            <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
              <p className="text-muted-foreground/60 text-xs">
                {t.helpsUnderstand}
              </p>
            </div>
          </>
        ) : step === "feeling" && selectedCategory ? (
          <>
            {/* Title */}
            <div className="text-center mb-6 animate-fade-in">
              <h1 className="text-2xl font-display font-light text-foreground mb-2 italic">
                {t.whatsMindDoing}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t.selectAllApply}
              </p>
            </div>

            {/* Feelings Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto pb-24 -mx-2 px-2">
              <div className="grid grid-cols-3 gap-3">
                {selectedCategory.thoughtKeys.map((thoughtKey, index) => {
                  const thought = t[thoughtKey];
                  const isSelected = selectedFeelings.includes(thought);
                  return (
                    <button
                      key={thoughtKey}
                      onClick={() => toggleFeeling(thought)}
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
                        {thought}
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
                          : `${selectedFeelings.length} ${t.thoughtsSelected}`
                        }
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t[selectedCategory.titleKey].toLowerCase()} {t.thinking}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {t.selectThoughtsAbove}
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
                {language === "hi" ? "मैं महसूस कर रहा हूं" : "I'm feeling"}
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

            {/* Intensity Slider - Always visible */}
            <div 
              className="mb-6 animate-fade-in bg-muted/40 backdrop-blur-sm rounded-3xl p-5"
              style={{ animationDelay: "100ms" }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground/80">{t.howIntense}</span>
                  <span 
                    className="text-sm font-semibold px-4 py-1.5 rounded-full"
                    style={{ 
                      backgroundColor: `${getIntensityColor()}15`,
                      color: getIntensityColor()
                    }}
                  >
                    {getIntensityLabel()}
                  </span>
                </div>
                <div className="relative pt-1">
                  <div 
                    className="absolute inset-0 rounded-full h-2 top-1/2 -translate-y-1/2"
                    style={{
                      background: selectedCategory 
                        ? `linear-gradient(to right, ${getIntensityColor()}30, ${getIntensityColor()})`
                        : undefined
                    }}
                  />
                  <Slider
                    value={[feelingIntensity]}
                    onValueChange={(value) => setFeelingIntensity(value[0])}
                    max={100}
                    step={1}
                    className="relative z-10"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground/70">
                  <span>{language === "hi" ? "मुश्किल से" : "Barely noticeable"}</span>
                  <span>{language === "hi" ? "बहुत तेज़" : "Overwhelming"}</span>
                </div>
              </div>
            </div>

            {/* Interactive Journal Section */}
            <div 
              className="mb-6 animate-fade-in bg-muted/40 backdrop-blur-sm rounded-3xl overflow-hidden"
              style={{ animationDelay: "150ms" }}
            >
              {/* Header - Always visible */}
              <button
                onClick={() => setIsJournalExpanded(!isJournalExpanded)}
                className="w-full p-4 flex items-center justify-between"
              >
                <span className="text-foreground/80 text-sm font-medium">
                  {isJournalExpanded 
                    ? (language === "hi" ? "जर्नल प्रविष्टि" : "Journal Entry") 
                    : (language === "hi" ? "जर्नल जोड़ें (वैकल्पिक)" : "Add Journal Entry (optional)")}
                </span>
                <div className="flex items-center gap-2">
                  {(selectedPrompts.length > 0 || freeformNote) && !isJournalExpanded && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {selectedPrompts.length + (freeformNote ? 1 : 0)} {language === "hi" ? "प्रविष्टियां" : "entries"}
                    </span>
                  )}
                  {isJournalExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expandable Content */}
              <div className={`overflow-hidden transition-all duration-500 ease-out ${
                isJournalExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
              }`}>
                <div className="px-4 pb-5 space-y-5">
                  {/* Reflection Prompts */}
                  <div className="space-y-3">
                    <span className="text-sm text-foreground/70">{t.reflectionPrompts}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {reflectionPrompts.map((prompt) => {
                        const isSelected = selectedPrompts.includes(prompt.id);
                        return (
                          <button
                            key={prompt.id}
                            onClick={() => togglePrompt(prompt.id)}
                            className={`
                              p-3 rounded-2xl text-left transition-all duration-300
                              ${isSelected 
                                ? "bg-foreground/10 ring-1 ring-foreground/20" 
                                : "bg-muted/60 hover:bg-muted"
                              }
                            `}
                          >
                            <span className="text-lg mb-1 block">{prompt.icon}</span>
                            <span className="text-xs text-foreground/70 leading-tight">
                              {prompt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prompt Response Areas */}
                  {selectedPrompts.length > 0 && (
                    <div className="space-y-3 animate-fade-in">
                      {selectedPrompts.map((promptId) => {
                        const prompt = reflectionPrompts.find(p => p.id === promptId);
                        if (!prompt) return null;
                        return (
                          <div key={promptId} className="space-y-2">
                            <label className="text-xs text-foreground/60 flex items-center gap-2">
                              <span>{prompt.icon}</span>
                              {prompt.label}
                            </label>
                            <Textarea
                              value={promptResponses[promptId] || ""}
                              onChange={(e) => setPromptResponses(prev => ({
                                ...prev,
                                [promptId]: e.target.value
                              }))}
                              placeholder={language === "hi" ? "चिंतन के लिए टैप करें..." : "Tap to reflect..."}
                              className="min-h-[60px] bg-background/50 border-0 resize-none text-sm rounded-xl focus:ring-1 focus:ring-foreground/20"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Freeform Note */}
                  <div className="space-y-2">
                    <span className="text-sm text-foreground/70">{t.anythingElse}</span>
                    <Textarea
                      value={freeformNote}
                      onChange={(e) => setFreeformNote(e.target.value)}
                      placeholder={t.freeformPlaceholder}
                      className="min-h-[80px] bg-background/50 border-0 resize-none text-sm rounded-xl focus:ring-1 focus:ring-foreground/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Context Options */}
            <div className="flex-1 overflow-y-auto pb-28 space-y-6">
              {/* What are you doing? */}
              <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
                <h3 className="text-foreground/80 text-lg mb-3">{t.whatWereDoing}</h3>
                <div className="flex flex-wrap gap-2">
                  {addingActivity ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddActivity()}
                        placeholder={language === "hi" ? "गतिविधि जोड़ें..." : "Add activity..."}
                        className="h-10 w-32 rounded-full text-sm px-4 bg-background border-foreground/20"
                        autoFocus
                      />
                      <button 
                        onClick={handleAddActivity}
                        className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => { setAddingActivity(false); setNewActivity(""); }}
                        className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAddingActivity(true)}
                      className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                  {[...contextOptions.activities, ...customActivities].map((activity) => {
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
                <h3 className="text-foreground/80 text-lg mb-3">{t.whoWith}</h3>
                <div className="flex flex-wrap gap-2">
                  {addingCompanion ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={newCompanion}
                        onChange={(e) => setNewCompanion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddCompanion()}
                        placeholder={language === "hi" ? "साथी जोड़ें..." : "Add companion..."}
                        className="h-10 w-32 rounded-full text-sm px-4 bg-background border-foreground/20"
                        autoFocus
                      />
                      <button 
                        onClick={handleAddCompanion}
                        className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => { setAddingCompanion(false); setNewCompanion(""); }}
                        className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAddingCompanion(true)}
                      className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                  {[...contextOptions.companions, ...customCompanions].map((companion) => {
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
                <h3 className="text-foreground/80 text-lg mb-3">{t.whereAreYou}</h3>
                <div className="flex flex-wrap gap-2">
                  {addingLocation ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddLocation()}
                        placeholder={language === "hi" ? "स्थान जोड़ें..." : "Add location..."}
                        className="h-10 w-32 rounded-full text-sm px-4 bg-background border-foreground/20"
                        autoFocus
                      />
                      <button 
                        onClick={handleAddLocation}
                        className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => { setAddingLocation(false); setNewLocation(""); }}
                        className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAddingLocation(true)}
                      className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                  {[...contextOptions.locations, ...customLocations].map((location) => {
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
                  {t.startSession}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
