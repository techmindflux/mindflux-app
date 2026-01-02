import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/GlassCard";
import { ScoreRing } from "@/components/ScoreRing";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Moon, 
  TrendingUp, 
  ChevronRight, 
  Brain, 
  LogOut, 
  User,
  Sparkles 
} from "lucide-react";
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
  const trendValue = "+3";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-40 left-0 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-5 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Home</h1>
          <div className="flex items-center gap-2 mt-1">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {authType === "google" ? "Signed in" : "Guest"}
            </span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-5 pb-8 space-y-5">
        {/* Sleep Score Card */}
        <GlassCard className="animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Sleep Score</h2>
                <p className="text-sm text-muted-foreground">Last night's rest</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between">
            <ScoreRing score={sleepScore} size="lg" />
            
            <div className="flex-1 pl-6 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-score-good" />
                <span className="text-sm font-medium text-score-good">
                  {trendValue} vs yesterday
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your sleep quality is improving. Keep up the good routine!
              </p>
              <Button variant="ghost" size="sm" className="text-primary -ml-3" disabled>
                <Sparkles className="w-4 h-4" />
                View details
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Stress Test Card */}
        <GlassCard className="animate-slide-up delay-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center">
                <Brain className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Stress Test</h2>
                <p className="text-sm text-muted-foreground">Measure your stress levels</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs font-medium">
              In development
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Our advanced stress detection model is currently being refined to provide you with accurate insights.
          </p>

          <Button 
            variant="secondary" 
            className="w-full opacity-60" 
            disabled
          >
            Start Test
          </Button>
        </GlassCard>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 animate-fade-in delay-200"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </main>
    </div>
  );
}
