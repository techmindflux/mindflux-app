import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Plus, Trash2, PanelLeftClose, PanelLeft, BookOpen, History, Brain, Heart, Moon, Leaf, Sparkles, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  onSelectTopic?: (topic: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  userId: string;
}

type SidebarTab = 'library' | 'history';

const libraryTopics = [
  {
    id: "stress-management",
    title: "Stress Management",
    subtitle: "Techniques to find calm",
    icon: Wind,
    gradient: "from-blue-600/80 via-teal-500/70 to-cyan-400/60",
    bgImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format"
  },
  {
    id: "anxiety-relief",
    title: "Anxiety Relief",
    subtitle: "Quiet your racing mind",
    icon: Sparkles,
    gradient: "from-purple-600/80 via-violet-500/70 to-indigo-400/60",
    bgImage: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&h=300&fit=crop&auto=format"
  },
  {
    id: "better-sleep",
    title: "Better Sleep",
    subtitle: "Rest deeply tonight",
    icon: Moon,
    gradient: "from-indigo-700/80 via-blue-600/70 to-slate-500/60",
    bgImage: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=300&fit=crop&auto=format"
  },
  {
    id: "mindfulness",
    title: "Mindfulness",
    subtitle: "Be present in the moment",
    icon: Leaf,
    gradient: "from-emerald-600/80 via-green-500/70 to-teal-400/60",
    bgImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&auto=format"
  },
  {
    id: "emotional-wellness",
    title: "Emotional Wellness",
    subtitle: "Understand your feelings",
    icon: Heart,
    gradient: "from-rose-600/80 via-pink-500/70 to-orange-400/60",
    bgImage: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop&auto=format"
  },
  {
    id: "mental-resilience",
    title: "Mental Resilience",
    subtitle: "Build inner strength",
    icon: Brain,
    gradient: "from-amber-600/80 via-orange-500/70 to-yellow-400/60",
    bgImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop&auto=format"
  },
];

export function LuminaChatSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onSelectTopic,
  isOpen,
  onToggle,
  userId,
}: LuminaChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>('library');

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

  const navigate = useNavigate();

  const handleTopicClick = (topic: typeof libraryTopics[0]) => {
    navigate(`/library/${topic.id}`);
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
    <aside className="w-72 h-full bg-background/95 backdrop-blur-md border-r border-border/50 flex flex-col">
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

      {/* Tab Navigation */}
      <div className="px-3 py-2 border-b border-border/30">
        <div className="flex gap-1 p-0.5 bg-muted/30 rounded-lg">
          <button
            onClick={() => setActiveTab('library')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200",
              activeTab === 'library'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Library
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200",
              activeTab === 'history'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="h-3.5 w-3.5" />
            History
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'library' ? (
          <div className="space-y-3">
            <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider px-1">
              Topics to Explore
            </p>
            <div className="grid gap-2.5">
              {libraryTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className="group relative overflow-hidden rounded-xl aspect-[2.2/1] text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${topic.bgImage})` }}
                  />
                  {/* Gradient Overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity duration-300 group-hover:opacity-80",
                    topic.gradient
                  )} />
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <topic.icon className="h-4 w-4 text-white/90" />
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        {topic.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-white/80 font-light">
                      {topic.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : isLoading ? (
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
