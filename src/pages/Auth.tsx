import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { loginAsGuest, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/home");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate("/home");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-float delay-300" />
      </div>

      {/* Header with theme toggle */}
      <header className="relative z-10 flex justify-end p-4">
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm space-y-12">
          {/* Logo and branding */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="MindFlux Logo" 
                className="w-32 h-32 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground font-display">
              MindFlux
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Calmness Quantified
            </p>
          </div>

          {/* Auth buttons */}
          <div className="space-y-4 animate-slide-up delay-200">
            <Button
              variant="google"
              size="lg"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <Button
              variant="guest"
              size="lg"
              className="w-full"
              onClick={handleGuestLogin}
            >
              Continue as Guest
            </Button>
          </div>

          {/* Terms */}
          <p className="text-center text-sm text-muted-foreground animate-fade-in delay-400">
            By continuing you agree to our Privacy Policy and Terms of Service
          </p>
        </div>
      </main>
    </div>
  );
}
