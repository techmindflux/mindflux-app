import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Feather, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";

interface JournalState {
  thought: string;
  rootCause: string;
}

export default function Journal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const state = location.state as JournalState | null;
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Redirect if no state provided
  useEffect(() => {
    if (!state?.thought || !state?.rootCause) {
      navigate("/home");
    }
  }, [state, navigate]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = async () => {
    if (!user || !state) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from("journals").insert({
        user_id: user.id,
        thought: state.thought,
        root_cause: state.rootCause,
        content: content.trim() || null,
      });

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: language === "hi" ? "जर्नल सहेजा गया" : "Journal saved",
        description: language === "hi" 
          ? "आपकी जर्नल प्रविष्टि सफलतापूर्वक सहेजी गई।"
          : "Your journal entry has been saved successfully.",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      console.error("Failed to save journal:", error);
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" 
          ? "जर्नल सहेजने में विफल। कृपया पुनः प्रयास करें।"
          : "Failed to save journal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!state) return null;

  const journalPrompts = language === "hi" 
    ? [
        "इस विचार के बारे में मुझे कैसा महसूस होता है?",
        "मैं इससे क्या सीख सकता हूं?",
        "मैं अपने आप को क्या बताना चाहता हूं?",
        "आगे मैं क्या कदम उठा सकता हूं?",
      ]
    : [
        "How does this thought make me feel?",
        "What can I learn from this?",
        "What would I tell a friend in this situation?",
        "What small step can I take next?",
      ];

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 via-accent/6 to-transparent rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl animate-breathe delay-300" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={isSaving || isSaved || !user}
          className="rounded-full gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              {language === "hi" ? "सहेज रहे हैं..." : "Saving..."}
            </>
          ) : isSaved ? (
            <>
              <Sparkles className="w-4 h-4" />
              {language === "hi" ? "सहेजा गया" : "Saved"}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {language === "hi" ? "सहेजें" : "Save"}
            </>
          )}
        </Button>
      </header>

      {/* Journal Content */}
      <div className="relative z-10 px-6 pb-12 max-w-2xl mx-auto animate-fade-in">
        {/* Journal Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
            <Feather className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Thought as Heading */}
        <div className="text-center mb-2">
          <h1 className="font-display text-xl md:text-2xl font-medium text-foreground leading-relaxed">
            "{state.thought}"
          </h1>
        </div>

        {/* Root Cause as Subheading */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">
            {language === "hi" ? "मूल कारण:" : "Root cause:"}{" "}
            <span className="text-foreground/80 font-medium">{state.rootCause}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-xs text-muted-foreground/50 uppercase tracking-widest">
            {language === "hi" ? "अपने विचार लिखें" : "Write your thoughts"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Writing Prompts */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground/70 mb-3 text-center">
            {language === "hi" ? "प्रेरणा के लिए प्रश्न:" : "Prompts to guide you:"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {journalPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setContent((prev) => prev + (prev ? "\n\n" : "") + prompt + "\n")}
                className="px-3 py-1.5 text-xs rounded-full border border-border/40 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground hover:border-border transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Journal Textarea */}
        <div className="glass-card p-6 mb-8">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={language === "hi" 
              ? "अपने विचारों और भावनाओं को स्वतंत्र रूप से लिखें..." 
              : "Let your thoughts flow freely..."}
            className="min-h-[300px] border-0 bg-transparent resize-none focus-visible:ring-0 text-base leading-relaxed placeholder:text-muted-foreground/40"
            disabled={isSaving || isSaved}
          />
        </div>

        {/* Gentle Reminder */}
        {!user && (
          <div className="text-center p-4 rounded-2xl bg-secondary/30 border border-border/30">
            <p className="text-sm text-muted-foreground">
              {language === "hi" 
                ? "अपनी जर्नल प्रविष्टियों को सहेजने के लिए साइन इन करें।"
                : "Sign in to save your journal entries."}
            </p>
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="mt-2"
            >
              {language === "hi" ? "साइन इन करें" : "Sign In"}
            </Button>
          </div>
        )}

        {/* Mindful Quote */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/50 italic">
            {language === "hi" 
              ? '"जर्नलिंग आपकी आत्मा से बातचीत करने जैसा है।"'
              : '"Journaling is like whispering to one\'s self and listening at the same time."'}
          </p>
        </div>
      </div>
    </main>
  );
}
