import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Heart } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, authType, logout, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  // Get display name from user or default to guest
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  // Placeholder last stress score (null means no check-in yet)
  const lastStressScore: number | null = null;

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
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 flex flex-col items-center justify-center pb-24">
        
        {/* Stress Check-in Circle */}
        <div className="flex flex-col items-center text-center animate-slide-up">
          {/* Circle container */}
          <div 
            className="relative w-52 h-52 rounded-full glass-card flex items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
            onClick={() => {/* TODO: Navigate to stress check-in */}}
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Inner content */}
            <div className="relative z-10 flex flex-col items-center">
              {lastStressScore !== null ? (
                <>
                  <span className="text-5xl font-display font-light text-foreground">
                    {lastStressScore}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">/100</span>
                </>
              ) : (
                <>
                  <Heart className="w-10 h-10 text-primary/70 mb-2" />
                  <span className="text-sm text-muted-foreground">Tap to begin</span>
                </>
              )}
            </div>

            {/* Progress ring (only show if there's a score) */}
            {lastStressScore !== null && (
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
                  strokeWidth="2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${lastStressScore * 2.89} 289`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            )}
          </div>

          {/* Label */}
          <h2 className="text-xl font-display font-medium text-foreground mt-8">
            Stress Check-in
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
            {lastStressScore !== null 
              ? "Your last assessment score" 
              : "Take a moment to understand your stress levels"
            }
          </p>

          {/* CTA Button */}
          <Button 
            variant="secondary" 
            className="mt-8 rounded-xl h-12 px-8 font-medium"
            onClick={() => {/* TODO: Navigate to stress check-in */}}
          >
            {lastStressScore !== null ? "Check in again" : "Begin Check-in"}
          </Button>
        </div>
      </main>

      {/* Logout - positioned at bottom */}
      <div className="relative z-10 px-6 pb-8 animate-fade-in delay-300">
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground hover:bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
