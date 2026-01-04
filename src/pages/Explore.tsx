import { MessageCircleHeart, Wind, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function Explore() {
  const navigate = useNavigate();

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
      <section className="px-6 space-y-4 pb-32">
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
    </main>
  );
}
