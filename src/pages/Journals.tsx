import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Pencil, Trash2, ChevronRight, Lock, Calendar, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";

interface Journal {
  id: string;
  thought: string;
  root_cause: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export default function Journals() {
  const navigate = useNavigate();
  const { user, authType } = useAuth();
  const { language } = useLanguage();
  const isGuest = authType === "guest";
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isGuest) {
      fetchJournals();
    } else {
      setIsLoading(false);
    }
  }, [user, isGuest]);

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJournals(data || []);
    } catch (error) {
      console.error("Failed to fetch journals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return language === "hi" ? "आज" : "Today";
    }
    if (isYesterday(date)) {
      return language === "hi" ? "कल" : "Yesterday";
    }
    const days = differenceInDays(new Date(), date);
    if (days < 7) {
      return language === "hi" 
        ? `${days} दिन पहले` 
        : `${days} days ago`;
    }
    return format(date, "MMM d, yyyy");
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), "h:mm a");
  };

  const handleEdit = () => {
    if (selectedJournal) {
      setEditContent(selectedJournal.content || "");
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedJournal) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("journals")
        .update({ content: editContent.trim() || null })
        .eq("id", selectedJournal.id);

      if (error) throw error;

      setJournals(journals.map(j => 
        j.id === selectedJournal.id 
          ? { ...j, content: editContent.trim() || null, updated_at: new Date().toISOString() }
          : j
      ));
      setSelectedJournal({ ...selectedJournal, content: editContent.trim() || null });
      setIsEditing(false);
      
      toast({
        title: language === "hi" ? "सहेजा गया" : "Saved",
        description: language === "hi" ? "आपकी जर्नल अपडेट हो गई।" : "Your journal has been updated.",
      });
    } catch (error) {
      console.error("Failed to save:", error);
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "सहेजने में विफल।" : "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from("journals")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setJournals(journals.filter(j => j.id !== deleteId));
      if (selectedJournal?.id === deleteId) {
        setSelectedJournal(null);
      }
      
      toast({
        title: language === "hi" ? "हटाया गया" : "Deleted",
        description: language === "hi" ? "जर्नल प्रविष्टि हटा दी गई।" : "Journal entry has been deleted.",
      });
    } catch (error) {
      console.error("Failed to delete:", error);
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "हटाने में विफल।" : "Failed to delete.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  // Sign in required screen for guests
  if (!user || isGuest) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Lock className="w-9 h-9 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="font-display text-2xl font-medium text-foreground mb-2">
            {language === "hi" ? "साइन इन आवश्यक" : "Sign In Required"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === "hi" 
              ? "अपनी जर्नल प्रविष्टियों को देखने के लिए Google खाते से लॉग इन करें।"
              : "Log in with your Google account to view your journal entries."}
          </p>
          <Button onClick={() => navigate("/")} className="rounded-full">
            {language === "hi" ? "लॉग इन करें" : "Log In"}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/8 via-orange-500/5 to-transparent rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/6 to-transparent rounded-full blur-3xl animate-breathe delay-300" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-light text-foreground tracking-tight">
              {language === "hi" ? "मेरी जर्नल" : "My Journals"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "hi" ? "आपके विचारों का संग्रह" : "A collection of your reflections"}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 px-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
              <BookOpen className="w-9 h-9 text-muted-foreground/50" />
            </div>
            <h2 className="font-display text-xl text-foreground mb-2">
              {language === "hi" ? "अभी कोई जर्नल नहीं" : "No journals yet"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {language === "hi" 
                ? "जब आप Thought Unpacker से जर्नल करेंगे, वे यहां दिखाई देंगी।"
                : "When you journal from the Thought Unpacker, they'll appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {journals.map((journal, index) => (
              <button
                key={journal.id}
                onClick={() => setSelectedJournal(journal)}
                className="w-full glass-card p-4 text-left hover:bg-card/80 transition-all duration-200 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-1 mb-1">
                      "{journal.thought}"
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {language === "hi" ? "मूल कारण:" : "Root:"} {journal.root_cause}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(journal.created_at)}</span>
                      <span>•</span>
                      <span>{formatTime(journal.created_at)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Journal Detail Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="min-h-screen px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedJournal(null);
                  setIsEditing(false);
                }}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="rounded-full"
                    >
                      {language === "hi" ? "रद्द करें" : "Cancel"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="rounded-full gap-2"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {language === "hi" ? "सहेजें" : "Save"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEdit}
                      className="rounded-full"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(selectedJournal.id)}
                      className="rounded-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Journal Content */}
            <div className="max-w-2xl mx-auto animate-slide-up">
              {/* Date */}
              <div className="text-center mb-6">
                <span className="text-xs text-muted-foreground/70">
                  {formatDate(selectedJournal.created_at)} • {formatTime(selectedJournal.created_at)}
                </span>
              </div>

              {/* Thought */}
              <h1 className="font-display text-xl md:text-2xl font-medium text-foreground text-center leading-relaxed mb-3">
                "{selectedJournal.thought}"
              </h1>

              {/* Root Cause */}
              <p className="text-sm text-muted-foreground text-center mb-8">
                {language === "hi" ? "मूल कारण:" : "Root cause:"}{" "}
                <span className="text-foreground/80 font-medium">{selectedJournal.root_cause}</span>
              </p>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <BookOpen className="w-4 h-4 text-muted-foreground/30" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="glass-card p-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder={language === "hi" 
                      ? "अपने विचार यहां लिखें..." 
                      : "Write your thoughts here..."}
                    className="min-h-[250px] border-0 bg-transparent resize-none focus-visible:ring-0 text-base leading-relaxed"
                    autoFocus
                  />
                </div>
              ) : selectedJournal.content ? (
                <div className="glass-card p-6">
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {selectedJournal.content}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground/60 italic">
                    {language === "hi" ? "कोई सामग्री नहीं लिखी गई।" : "No content was written."}
                  </p>
                  <Button
                    variant="link"
                    onClick={handleEdit}
                    className="mt-2"
                  >
                    {language === "hi" ? "अभी लिखें" : "Write now"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "hi" ? "जर्नल हटाएं?" : "Delete journal?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "hi" 
                ? "यह क्रिया पूर्ववत नहीं की जा सकती। यह जर्नल प्रविष्टि स्थायी रूप से हटा दी जाएगी।"
                : "This action cannot be undone. This journal entry will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              {language === "hi" ? "रद्द करें" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === "hi" ? "हटाएं" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
