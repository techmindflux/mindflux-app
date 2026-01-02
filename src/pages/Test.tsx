import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskConical, 
  Lightbulb, 
  Clock,
  ArrowLeft
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Test() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-0 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-5 pt-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Test</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-5 pb-8 space-y-5">
        <GlassCard className="animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Testing Hub</h2>
              <p className="text-sm text-muted-foreground">Experimental features</p>
            </div>
            <Badge variant="outline" className="text-xs">Beta</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This section will house future testing capabilities and experimental wellness features.
          </p>
        </GlassCard>

        <div className="grid gap-4">
          <GlassCard className="animate-slide-up delay-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Mood Tracking</h3>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="animate-slide-up delay-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Focus Timer</h3>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
