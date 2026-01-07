import { useState } from "react";
import { MessageCircleHeart, Wind, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MindConceptCard, type MindConcept } from "@/components/MindConceptCard";
import { MindConceptChat } from "@/components/MindConceptChat";

const features = [
  {
    id: "guided-reflection",
    title: "Guided Reflection",
    subtitle: "Help me understand what I'm feeling",
    description: "A conversational space to explore stress, anxiety, emotions, or confusion with gentle guidance.",
    icon: MessageCircleHeart,
    gradient: "from-primary/20 to-accent/20",
  },
  {
    id: "calm-explorer",
    title: "Calm Explorer",
    subtitle: "Show me ways to calm my mind",
    description: "Learn simple breathing, grounding, and mindfulness techniques with context on when to use them.",
    icon: Wind,
    gradient: "from-accent/20 to-secondary/30",
  },
  {
    id: "thought-unpacker",
    title: "Thought Unpacker",
    subtitle: "This thought is bothering me",
    description: "Break down anxious or looping thoughts with gentle reframing and reflection prompts.",
    icon: Brain,
    gradient: "from-secondary/30 to-primary/20",
  },
];

const mindConcepts: MindConcept[] = [
  {
    id: "stress-vs-anxiety",
    title: "Stress vs Anxiety",
    subtitle: "They feel similar, but they're not the same",
    icon: "⚡",
    explanation: "Stress is your body's response to an external pressure—like a deadline or a conflict. It usually fades when the situation resolves. Anxiety, however, often lingers without a clear cause. It's that uneasy feeling that something's wrong, even when things seem fine. Recognizing which you're feeling helps you respond with the right tools.",
  },
  {
    id: "why-thoughts-loop",
    title: "Why Thoughts Loop",
    subtitle: "The mind's attempt to solve the unsolvable",
    icon: "🔄",
    explanation: "When your brain encounters an unresolved problem—especially an emotional one—it keeps returning to it, trying to find a solution. This rumination feels productive but often isn't. The loop continues because the mind confuses thinking about a problem with solving it. Breaking the cycle often requires stepping out of the thinking mode entirely.",
  },
  {
    id: "body-before-logic",
    title: "Why the Body Reacts Before Logic",
    subtitle: "Your nervous system is faster than your thoughts",
    icon: "💓",
    explanation: "Your amygdala, the brain's alarm system, processes threats in milliseconds—before your logical brain even gets the information. That's why your heart races or palms sweat before you consciously understand why. This ancient survival mechanism helped our ancestors, but today it can misfire, treating emails like tigers.",
  },
  {
    id: "what-burnout-is",
    title: "What Burnout Actually Is",
    subtitle: "More than just being tired",
    icon: "🔥",
    explanation: "Burnout isn't exhaustion from working hard—it's the result of prolonged stress without adequate recovery. It shows up as emotional depletion, cynicism, and reduced effectiveness. Unlike tiredness, a weekend off won't fix it. Burnout signals that something fundamental about your relationship with work or life needs to change.",
  },
  {
    id: "emotions-vs-moods",
    title: "Emotions vs Moods",
    subtitle: "One is a wave, the other is the tide",
    icon: "🌊",
    explanation: "Emotions are short, intense responses to specific events—like feeling angry when someone cuts you off. Moods are longer, subtler states that color everything, often without a clear trigger. You might be in a low mood for days without knowing why. Understanding this helps you respond appropriately to each.",
  },
];

export default function Explore() {
  const navigate = useNavigate();
  const [selectedConcept, setSelectedConcept] = useState<MindConcept | null>(null);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <h1 className="font-display text-3xl font-light text-foreground tracking-tight">
          Explore
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose a path to calm your mind
        </p>
      </header>

      {/* Feature Cards */}
      <section className="px-6 space-y-4">
        {features.map((feature, index) => (
          <button
            key={feature.id}
            onClick={() => navigate(`/explore/${feature.id}`)}
            className={`w-full glass-card p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
          >
            {/* Gradient background accent */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 rounded-3xl`} />
            
            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h2>
                <p className="text-sm text-primary/80 font-medium mt-0.5">
                  "{feature.subtitle}"
                </p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* Understand Your Mind Section */}
      <section className="px-6 pt-10 pb-32">
        <div className="mb-5">
          <h2 className="font-display text-xl font-light text-foreground tracking-tight">
            Understand Your Mind
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Learn concepts, then explore them in yourself
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {mindConcepts.map((concept, index) => (
            <MindConceptCard
              key={concept.id}
              concept={concept}
              index={index}
              onExplore={setSelectedConcept}
            />
          ))}
        </div>
      </section>

      {/* Concept Chat */}
      {selectedConcept && (
        <MindConceptChat
          concept={selectedConcept}
          isOpen={!!selectedConcept}
          onClose={() => setSelectedConcept(null)}
        />
      )}
    </main>
  );
}
