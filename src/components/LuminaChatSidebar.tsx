import { useState, useEffect } from "react";
import { MessageSquare, Plus, Trash2, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface LuminaChatSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onToggle: () => void;
  userId: string;
}

export function LuminaChatSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onToggle,
  userId,
}: LuminaChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("lumina_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("lumina_conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setConversations((prev) => prev.filter((c) => c.id !== id));
      
      if (currentConversationId === id) {
        onNewConversation();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = new Date(conv.updated_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    let label = "Today";
    if (diffDays === 1) label = "Yesterday";
    else if (diffDays > 1 && diffDays <= 7) label = "Previous 7 Days";
    else if (diffDays > 7 && diffDays <= 30) label = "Previous 30 Days";
    else if (diffDays > 30) label = "Older";

    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  // Toggle button when sidebar is closed
  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed left-4 top-20 z-50 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-md hover:bg-muted"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <aside className="w-64 h-full bg-background/95 backdrop-blur-md border-r border-border/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <Button
          onClick={onNewConversation}
          size="sm"
          className="flex-1 mr-2 rounded-full text-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Chat
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="rounded-full shrink-0"
        >
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Start chatting to save your history</p>
          </div>
        ) : (
          Object.entries(groupedConversations).map(([label, convs]) => (
            <div key={label} className="mb-4">
              <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide px-2 mb-1.5">
                {label}
              </p>
              <div className="space-y-0.5">
                {convs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={cn(
                      "group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                      currentConversationId === conv.id
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
                    <span className="flex-1 text-xs truncate">{conv.title}</span>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
