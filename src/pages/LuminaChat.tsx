import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Leaf, Wind, ExternalLink, BookOpen, Video, Headphones, FileText, Moon, Heart, Brain, Smile, Users, Coffee, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Source {
  id: number;
  url: string;
  domain: string;
  type: "video" | "book" | "podcast" | "article";
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Helper function to render markdown links as clickable
const renderMessageContent = (content: string) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
};

// Source type icon component
const SourceIcon = ({ type }: { type: Source["type"] }) => {
  switch (type) {
    case "video":
      return <Video className="w-3.5 h-3.5" />;
    case "book":
      return <BookOpen className="w-3.5 h-3.5" />;
    case "podcast":
      return <Headphones className="w-3.5 h-3.5" />;
    default:
      return <FileText className="w-3.5 h-3.5" />;
  }
};

// Perplexity-style source card
const SourceCard = ({ source }: { source: Source }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all duration-200"
  >
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary shrink-0">
      <SourceIcon type={source.type} />
    </div>
    <span className="text-xs text-muted-foreground group-hover:text-foreground truncate max-w-[140px] transition-colors">
      {source.domain}
    </span>
    <ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary shrink-0 transition-colors" />
  </a>
);

// Sources section component
const SourcesSection = ({ sources }: { sources: Source[] }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/30">
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        Sources
      </p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </div>
    </div>
  );
};

export default function LuminaChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const greeting: Message = {
      role: "assistant",
      content: "Hello. I'm Lumina, your mental wellness companion. This is a safe space to explore how you're feeling. What's on your mind today?"
    };
    setMessages([greeting]);
  }, []);

  // Function to search for sources using Perplexity
  const searchSources = async (query: string): Promise<Source[]> => {
    try {
      setIsSearching(true);
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lumina-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error("Search failed");
        return [];
      }

      const data = await response.json();
      return data.sources || [];
    } catch (error) {
      console.error("Error searching sources:", error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Get AI response
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lumina-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          isChat: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      // Check if the response suggests resources or if we're past the initial exchange
      const shouldSearchSources = 
        data.content.toLowerCase().includes("here") ||
        data.content.toLowerCase().includes("might help") ||
        data.content.toLowerCase().includes("resource") ||
        data.content.toLowerCase().includes("try") ||
        data.content.toLowerCase().includes("suggest") ||
        data.content.toLowerCase().includes("recommend") ||
        updatedMessages.length >= 4; // After 2 exchanges, start providing sources

      let sources: Source[] = [];
      if (shouldSearchSources) {
        // Create a search query from the conversation context
        const userMessages = updatedMessages.filter(m => m.role === "user").map(m => m.content);
        const searchQuery = userMessages.slice(-2).join(" "); // Use last 2 user messages for context
        sources = await searchSources(searchQuery);
      }

      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.content,
        sources: sources.length > 0 ? sources : undefined
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: "I feel stressed", icon: Wind },
    { label: "Help me reflect", icon: Sparkles },
    { label: "Grounding exercise", icon: Leaf },
  ];

  const topicCards = [
    { 
      shortcut: "/sleep",
      icon: Moon,
      title: "Improve my sleep quality and wind down for better rest tonight"
    },
    { 
      shortcut: "/anxiety",
      icon: Brain,
      title: "Help me manage anxious thoughts and find calm"
    },
    { 
      shortcut: "/motivation",
      icon: Zap,
      title: "Boost my motivation when I'm feeling stuck or unmotivated"
    },
    { 
      shortcut: "/self-care",
      icon: Heart,
      title: "Create a self-care routine that works for my lifestyle"
    },
    { 
      shortcut: "/focus",
      icon: Coffee,
      title: "Improve my concentration and stay focused on what matters"
    },
    { 
      shortcut: "/relationships",
      icon: Users,
      title: "Navigate difficult conversations and improve my connections"
    },
    { 
      shortcut: "/mood",
      icon: Smile,
      title: "Understand my emotions and lift my mood today"
    },
    { 
      shortcut: "/mindfulness",
      icon: Leaf,
      title: "Practice being present and reduce overthinking"
    },
  ];

  const handleTopicClick = (topic: typeof topicCards[0]) => {
    setInput(topic.title);
    inputRef.current?.focus();
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="ambient-glow w-[500px] h-[500px] -top-48 -right-48 bg-primary/20 animate-breathe" />
        <div className="ambient-glow w-[400px] h-[400px] bottom-32 -left-32 bg-accent/30 animate-breathe delay-300" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 px-4 py-4 border-b border-border/30">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-medium">Lumina</h1>
            <p className="text-xs text-muted-foreground">Your wellness companion</p>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex animate-fade-in",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "glass-card rounded-bl-md"
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {renderMessageContent(message.content)}
              </p>
              {message.sources && <SourcesSection sources={message.sources} />}
            </div>
          </div>
        ))}

        {(isLoading || isSearching) && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-100" />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-200" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {isSearching ? "Finding resources..." : "Lumina is thinking..."}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions and topic cards (show when no messages or after greeting) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4 space-y-4">
          {/* Quick action pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  setInput(action.label);
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass-button text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>

          {/* Mental health topic cards - horizontal scroll with staggered animation */}
          <div className="relative">
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              Explore topics
            </p>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
              {topicCards.map((topic, index) => (
                <button
                  key={topic.shortcut}
                  onClick={() => handleTopicClick(topic)}
                  className="group flex-shrink-0 w-[160px] text-left p-4 rounded-2xl glass-card border border-border/30 hover:border-primary/40 transition-all duration-300 hover:scale-[1.03] animate-fade-in"
                  style={{ 
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <topic.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-primary">{topic.shortcut}</span>
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2 leading-relaxed">
                    {topic.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="relative z-10 p-4 border-t border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <div className="flex-1 glass-card rounded-2xl overflow-hidden">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              rows={1}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <Button
            size="icon"
            className="rounded-full h-11 w-11 shrink-0"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
          Lumina is not a therapist. For crisis support, please contact a professional.
        </p>
      </div>
    </div>
  );
}
