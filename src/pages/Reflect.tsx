import { TrendingUp, Calendar, Activity, Brain } from "lucide-react";

const insights = [
  {
    id: "recent-checkins",
    title: "Recent Check-ins",
    value: "0",
    subtitle: "this week",
    icon: Calendar,
    gradient: "from-primary/20 to-accent/20",
  },
  {
    id: "avg-stress",
    title: "Average Stress",
    value: "—",
    subtitle: "no data yet",
    icon: Activity,
    gradient: "from-accent/20 to-secondary/30",
  },
  {
    id: "trend",
    title: "Trend",
    value: "—",
    subtitle: "start tracking",
    icon: TrendingUp,
    gradient: "from-secondary/30 to-primary/20",
  },
];

export default function Reflect() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <h1 className="font-display text-3xl font-light text-foreground tracking-tight">
          Reflect
        </h1>
        <p className="text-muted-foreground mt-1">
          Your stress patterns and insights
        </p>
      </header>

      {/* Insight Cards */}
      <section className="px-6 grid grid-cols-1 gap-4 pb-8">
        {insights.map((insight, index) => (
          <div
            key={insight.id}
            className="glass-card p-5 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
          >
            {/* Gradient background accent */}
            <div className={`absolute inset-0 bg-gradient-to-br ${insight.gradient} opacity-50 rounded-3xl`} />
            
            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <insight.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {insight.title}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-display font-medium text-foreground">
                    {insight.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {insight.subtitle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Patterns Section */}
      <section className="px-6 pb-32">
        <h2 className="font-display text-lg font-medium text-foreground mb-4">
          Patterns & Insights
        </h2>
        
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "backwards" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 rounded-3xl" />
          
          <div className="relative flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-primary/60" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Start Your Journey
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
              Complete a few stress check-ins to uncover patterns and personalized insights about your wellbeing.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
