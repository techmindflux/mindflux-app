import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Brain, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface CheckIn {
  id: string;
  category: string;
  intensity: number;
  feelings: string[];
  created_at: string;
}

const categoryColors: Record<string, string> = {
  ruminating: "text-violet-500",
  anxious: "text-amber-500",
  critical: "text-rose-500",
  clear: "text-emerald-500",
};

const categoryBg: Record<string, string> = {
  ruminating: "bg-violet-500/20",
  anxious: "bg-amber-400/20",
  critical: "bg-rose-500/20",
  clear: "bg-emerald-400/20",
};

const categoryChartColors: Record<string, string> = {
  ruminating: "#8b5cf6",
  anxious: "#f59e0b",
  critical: "#f43f5e",
  clear: "#10b981",
};

export default function Reflect() {
  const { authType, logout, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isBlocked = authType !== "google";
  
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckIns = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("stress_checkins")
          .select("id, category, intensity, feelings, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && data) {
          setCheckIns(data);
        }
      } catch (error) {
        console.error("Failed to fetch check-ins:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user?.id) {
      fetchCheckIns();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const handleLogin = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (isBlocked) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="glass-card p-8 max-w-sm w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-medium text-foreground mb-2">
            Sign In Required
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Log in with your Google account to access your stress patterns and personalized insights.
          </p>
          <Button
            onClick={handleLogin}
            className="w-full rounded-full"
          >
            Log In
          </Button>
        </div>
      </main>
    );
  }

  // Calculate insights from check-ins
  const thisWeekCheckIns = checkIns.filter((c) => {
    const date = new Date(c.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  });

  const avgIntensity = checkIns.length > 0 
    ? Math.round(checkIns.reduce((sum, c) => sum + c.intensity, 0) / checkIns.length)
    : null;

  const recentAvg = thisWeekCheckIns.length > 0
    ? Math.round(thisWeekCheckIns.reduce((sum, c) => sum + c.intensity, 0) / thisWeekCheckIns.length)
    : null;

  const olderCheckIns = checkIns.filter((c) => {
    const date = new Date(c.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return date >= twoWeeksAgo && date < weekAgo;
  });

  const olderAvg = olderCheckIns.length > 0
    ? Math.round(olderCheckIns.reduce((sum, c) => sum + c.intensity, 0) / olderCheckIns.length)
    : null;

  let trendDirection: "up" | "down" | "stable" | null = null;
  if (recentAvg !== null && olderAvg !== null) {
    const diff = recentAvg - olderAvg;
    if (diff > 5) trendDirection = "up";
    else if (diff < -5) trendDirection = "down";
    else trendDirection = "stable";
  }

  // Find most common category
  const categoryCounts: Record<string, number> = {};
  checkIns.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const mostCommonCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const insights = [
    {
      id: "recent-checkins",
      title: "Recent Check-ins",
      value: thisWeekCheckIns.length.toString(),
      subtitle: "this week",
      icon: Calendar,
      gradient: "from-primary/20 to-accent/20",
    },
    {
      id: "avg-stress",
      title: "Average Intensity",
      value: avgIntensity !== null ? avgIntensity.toString() : "—",
      subtitle: avgIntensity !== null ? "overall" : "no data yet",
      icon: Activity,
      gradient: "from-accent/20 to-secondary/30",
    },
    {
      id: "trend",
      title: "Weekly Trend",
      value: trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : trendDirection === "stable" ? "→" : "—",
      subtitle: trendDirection === "up" ? "intensity rising" : trendDirection === "down" ? "intensity falling" : trendDirection === "stable" ? "staying stable" : "need more data",
      icon: trendDirection === "down" ? TrendingDown : trendDirection === "stable" ? Minus : TrendingUp,
      gradient: "from-secondary/30 to-primary/20",
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <>
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

          {/* Patterns Section with Charts */}
          <section className="px-6 pb-8">
            <h2 className="font-display text-lg font-medium text-foreground mb-4">
              Patterns & Insights
            </h2>
            
            {checkIns.length > 0 ? (
              <div className="space-y-4">
                {/* Category Distribution Chart */}
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "backwards" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 rounded-3xl" />
                  
                  <div className="relative">
                    <h3 className="text-sm font-medium text-foreground mb-4">Thought Pattern Distribution</h3>
                    
                    <div className="flex items-center gap-6">
                      {/* Donut Chart */}
                      <div className="w-32 h-32 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={55}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {Object.entries(categoryCounts).map(([category]) => (
                                <Cell 
                                  key={category} 
                                  fill={categoryChartColors[category] || "#6b7280"} 
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Legend */}
                      <div className="flex-1 space-y-2">
                        {Object.entries(categoryCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: categoryChartColors[category] || "#6b7280" }}
                                />
                                <span className="text-sm capitalize text-foreground">{category}</span>
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                {Math.round((count / checkIns.length) * 100)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intensity Trend Chart */}
                {checkIns.length >= 3 && (
                  <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 opacity-50 rounded-3xl" />
                    
                    <div className="relative">
                      <h3 className="text-sm font-medium text-foreground mb-4">Intensity Over Time</h3>
                      
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[...checkIns]
                              .reverse()
                              .slice(-10)
                              .map((c) => ({
                                date: new Date(c.created_at).toLocaleDateString("en-US", { 
                                  month: "short", 
                                  day: "numeric" 
                                }),
                                intensity: c.intensity,
                                category: c.category,
                              }))}
                            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                          >
                            <defs>
                              <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="date" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis 
                              domain={[0, 100]} 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "12px",
                                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                              }}
                              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
                              itemStyle={{ color: "hsl(var(--muted-foreground))" }}
                            />
                            <Area
                              type="monotone"
                              dataKey="intensity"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              fill="url(#intensityGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "500ms", animationFillMode: "backwards" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-muted/20 opacity-50 rounded-3xl" />
                  
                  <div className="relative grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-display font-medium text-foreground">{checkIns.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Check-ins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-display font-medium text-foreground">{avgIntensity ?? "—"}</p>
                      <p className="text-xs text-muted-foreground mt-1">Avg Intensity</p>
                    </div>
                    {mostCommonCategory && (
                      <div className="col-span-2 text-center pt-2 border-t border-border/50">
                        <p className={`text-lg font-medium capitalize ${categoryColors[mostCommonCategory]}`}>
                          {mostCommonCategory}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Most Frequent Pattern</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
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
                    Complete a few thought check-ins to uncover patterns and personalized insights about your mindset.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Recent Check-ins */}
          {checkIns.length > 0 && (
            <section className="px-6 pb-32">
              <h2 className="font-display text-lg font-medium text-foreground mb-4">
                Recent History
              </h2>
              
              <div className="space-y-3">
                {checkIns.slice(0, 10).map((checkIn, index) => (
                  <div
                    key={checkIn.id}
                    className="glass-card p-4 animate-slide-up"
                    style={{ animationDelay: `${400 + index * 50}ms`, animationFillMode: "backwards" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent rounded-3xl" />
                    
                    <div className="relative flex items-center gap-4">
                      {/* Intensity indicator */}
                      <div className={`w-12 h-12 rounded-xl ${categoryBg[checkIn.category]} flex items-center justify-center`}>
                        <span className={`text-lg font-display font-medium ${categoryColors[checkIn.category]}`}>
                          {checkIn.intensity}
                        </span>
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium capitalize ${categoryColors[checkIn.category]}`}>
                            {checkIn.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(checkIn.created_at)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {checkIn.feelings.slice(0, 3).map((feeling) => (
                            <span 
                              key={feeling}
                              className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full"
                            >
                              {feeling}
                            </span>
                          ))}
                          {checkIn.feelings.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{checkIn.feelings.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}