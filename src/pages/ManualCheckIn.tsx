import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function ManualCheckIn() {
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

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/check-in")}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Back"
        >
          <X className="h-5 w-5" />
        </Button>

        <h1 className="text-sm font-medium text-muted-foreground">
          Manual Check-in
        </h1>

        <div className="w-10" />
      </header>

      {/* Main content - Placeholder for now */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-display font-light text-foreground mb-3">
            Manual Check-in
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Coming soon — we'll build this together
          </p>
        </div>
      </main>
    </div>
  );
}
