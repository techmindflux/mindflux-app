import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Heart } from "lucide-react";
import { AppGuideChat } from "@/components/AppGuideChat";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LastCheckIn {
  category: string;
  intensity: number;
  feelings: string[];
  created_at: string;
}

const categoryColors: Record<string, { ring: string; bg: string; text: string }> = {
  overwhelmed: { ring: "stroke-rose-500", bg: "from-rose-500/20 to-red-500/20", text: "text-rose-500" },
  activated: { ring: "stroke-amber-400", bg: "from-amber-400/20 to-orange-400/20", text: "text-amber-500" },
  drained: { ring: "stroke-sky-400", bg: "from-sky-400/20 to-blue-500/20", text: "text-sky-500" },
  grounded: { ring: "stroke-emerald-400", bg: "from-emerald-400/20 to-green-500/20", text: "text-emerald-500" },
};

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, authType, logout, user, isLoading } = useAuth();
  const [lastCheckIn, setLastCheckIn] = useState<LastCheckIn | null>(null);
  const [loadingCheckIn, setLoadingCheckIn] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch last check-in for Google users
  useEffect(() => {
    const fetchLastCheckIn = async () => {
      if (authType !== "google" || !user?.id) {
        setLoadingCheckIn(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("stress_checkins")
          .select("category, intensity, feelings, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setLastCheckIn(data);
        }
      } catch (error) {
        console.error("Failed to fetch last check-in:", error);
      } finally {
        setLoadingCheckIn(false);
      }
    };

    if (!isLoading) {
      fetchLastCheckIn();
    }
  }, [authType, user?.id, isLoading]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  // Get display name from user or default to guest
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  // Best-effort audio unlock to allow TTS autoplay on the next screen
  const unlockAudio = async () => {
    try {
      // Resume AudioContext inside the user gesture.
      // This increases the chance that subsequent HTMLAudio playback works.
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as
        | typeof AudioContext
        | undefined;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      await ctx.resume();
      await ctx.close();
    } catch {
      // ignore
    }
  };

  const handleBeginCheckIn = async () => {
    await unlockAudio();
    navigate("/check-in");
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const colors = lastCheckIn ? categoryColors[lastCheckIn.category] || categoryColors.grounded : null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Serene ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="ambient-glow animate-breathe" 
          style={{
            top: '-10%',
            right: '-20%',
            width: '60%',
            height: '50%',
            background: 'hsl(210 50% 80%)',
          }}
        />
        <div 
          className="ambient-glow animate-breathe delay-300" 
          style={{
            bottom: '10%',
            left: '-15%',
            width: '50%',
            height: '40%',
            background: 'hsl(35 50% 85%)',
          }}
        />
        <div 
          className="ambient-glow animate-breathe delay-500" 
          style={{
            top: '40%',
            right: '-10%',
            width: '35%',
            height: '30%',
            background: 'hsl(150 35% 80%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <div className="animate-fade-in">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            {authType === "google" ? `Welcome, ${displayName || "back"}` : "Hello, Guest"}
          </p>
          <h1 className="text-3xl font-display font-light text-foreground mt-1">
            Your Sanctuary
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="glass"
            size="icon"
            onClick={handleLogout}
            className="rounded-full"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5 text-foreground" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 flex flex-col items-center justify-center pb-24">
        
        {/* Stress Check-in Circle */}
        <div className="flex flex-col items-center text-center animate-slide-up">
          {/* Circle container */}
          <div 
            className="relative w-52 h-52 rounded-full glass-card flex items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
            onClick={handleBeginCheckIn}
          >
            {/* Category-based glow effect */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${lastCheckIn && colors ? colors.bg : "from-primary/20 via-transparent to-accent/20"} opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
            
            {/* Inner content */}
            <div className="relative z-10 flex flex-col items-center">
              {lastCheckIn && !loadingCheckIn ? (
                <>
                  <span className={`text-5xl font-display font-light ${colors?.text || "text-foreground"}`}>
                    {lastCheckIn.intensity}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1 capitalize">
                    {lastCheckIn.category}
                  </span>
                </>
              ) : loadingCheckIn && authType === "google" ? (
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <>
                  <Heart className="w-10 h-10 text-primary/70 mb-2" />
                  <span className="text-sm text-muted-foreground">Tap to begin</span>
                </>
              )}
            </div>

            {/* Progress ring (only show if there's a check-in) */}
            {lastCheckIn && !loadingCheckIn && (
              <svg 
                className="absolute inset-0 w-full h-full -rotate-90" 
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="2.5"
                  className="opacity-40"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  className={colors?.ring || "stroke-primary"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${lastCheckIn.intensity * 2.89} 289`}
                  style={{ transition: "stroke-dasharray 1s ease-out" }}
                />
              </svg>
            )}
          </div>

          {/* Label */}
          <h2 className="text-xl font-display font-medium text-foreground mt-8">
            Stress Check-in
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-[220px]">
            {lastCheckIn 
              ? `Last check-in: ${getTimeAgo(lastCheckIn.created_at)}`
              : "Take a moment to understand your stress levels"
            }
          </p>

          {/* Feelings pills - show last feelings */}
          {lastCheckIn && lastCheckIn.feelings.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[280px]">
              {lastCheckIn.feelings.slice(0, 3).map((feeling) => (
                <span 
                  key={feeling}
                  className={`text-xs px-3 py-1 rounded-full bg-muted/60 ${colors?.text || "text-foreground"}`}
                >
                  {feeling}
                </span>
              ))}
              {lastCheckIn.feelings.length > 3 && (
                <span className="text-xs px-3 py-1 rounded-full bg-muted/40 text-muted-foreground">
                  +{lastCheckIn.feelings.length - 3}
                </span>
              )}
            </div>
          )}

          {/* CTA Button */}
          <Button 
            variant="secondary" 
            className="mt-8 rounded-xl h-12 px-8 font-medium"
            onClick={handleBeginCheckIn}
          >
            {lastCheckIn ? "Check in again" : "Begin Check-in"}
          </Button>
        </div>
      </main>

      {/* App Guide Chat */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 w-auto max-w-xs">
        <AppGuideChat />
      </div>
    </div>
  );
}