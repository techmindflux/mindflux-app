import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Moon, Sparkles, LogOut, Leaf } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, authType, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sleepScore = 78;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Serene ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Soft gradient orbs */}
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
            {authType === "google" ? "Welcome back" : "Hello, Guest"}
          </p>
          <h1 className="text-3xl font-display font-light text-foreground mt-1">
            Your Sanctuary
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 pt-4 pb-8 space-y-6">
        
        {/* Daily Insight */}
        <div className="animate-slide-up">
          <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
            "Peace comes from within. Do not seek it without."
          </p>
          <p className="text-muted-foreground/60 text-xs mt-2">— Buddha</p>
        </div>

        {/* Sleep Score Card */}
        <div className="glass-card p-6 animate-slide-up delay-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Moon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-display font-medium text-foreground">
                Sleep Quality
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Last night's rest
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-display font-light text-foreground">
                  {sleepScore}
                </span>
                <span className="text-lg text-muted-foreground font-light">/100</span>
              </div>
              <p className="text-sm text-score-good mt-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Above your weekly average
              </p>
            </div>
            
            {/* Minimal score arc */}
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${sleepScore * 0.97} 100`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stress Test Card */}
        <div className="glass-card p-6 animate-slide-up delay-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
              <Leaf className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-medium text-foreground">
                  Stress Assessment
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Coming soon
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-5 leading-relaxed">
            Our mindful stress assessment is being crafted with care. Soon you'll be able to understand your stress patterns.
          </p>

          <Button 
            variant="secondary" 
            className="w-full mt-5 rounded-xl h-12 font-medium" 
            disabled
          >
            Begin Assessment
          </Button>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-8" />

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground hover:bg-transparent animate-fade-in delay-300"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </main>
    </div>
  );
}
