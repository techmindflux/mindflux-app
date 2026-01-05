import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { X, Mic, ClipboardList } from "lucide-react";

export default function CheckInOptions() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-muted/10" />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] bg-primary/10" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full blur-[100px] bg-accent/10" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/home")}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="w-10" />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {/* Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-3xl font-display font-light text-foreground mb-3">
            How would you like to check in?
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Choose the method that feels right for you
          </p>
        </div>

        {/* Options */}
        <div className="w-full max-w-sm space-y-4 animate-slide-up">
          {/* Manual Check-in */}
          <button
            onClick={() => navigate("/check-in/manual")}
            className="w-full group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 text-left transition-all duration-300 hover:border-primary/30 hover:bg-card/50 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                <ClipboardList className="w-6 h-6 text-foreground/70 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Manual Check-in
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Answer a few simple questions at your own pace
                </p>
              </div>
            </div>
            {/* Subtle hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </button>

          {/* Voice Check-in */}
          <button
            onClick={() => navigate("/check-in/voice")}
            className="w-full group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 text-left transition-all duration-300 hover:border-accent/30 hover:bg-card/50 hover:shadow-lg hover:shadow-accent/5"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center transition-colors group-hover:bg-accent/10">
                <Mic className="w-6 h-6 text-foreground/70 group-hover:text-accent transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Voice Check-in
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Have a gentle conversation with Lumina
                </p>
              </div>
            </div>
            {/* Subtle hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </button>
        </div>
      </main>
    </div>
  );
}
