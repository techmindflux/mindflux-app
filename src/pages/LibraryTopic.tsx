import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, BookOpen, Video, Headphones, FileText, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Source {
  id: number;
  url: string;
  domain: string;
  type: "video" | "book" | "podcast" | "article";
  title?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const topicData: Record<string, { title: string; subtitle: string; initialQuery: string; bgImage: string; gradient: string }> = {
  "stress-management": {
    title: "Stress Management",
    subtitle: "Techniques to find calm in daily life",
    initialQuery: "comprehensive guide to stress management techniques including breathing exercises, time management strategies, and lifestyle changes for reducing chronic stress",
    bgImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&auto=format",
    gradient: "from-blue-600/90 via-teal-500/80 to-cyan-400/70"
  },
  "anxiety-relief": {
    title: "Anxiety Relief",
    subtitle: "Quiet your racing mind",
    initialQuery: "evidence-based anxiety relief techniques including cognitive behavioral therapy strategies, grounding exercises, and mindfulness practices for managing anxiety",
    bgImage: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&h=600&fit=crop&auto=format",
    gradient: "from-purple-600/90 via-violet-500/80 to-indigo-400/70"
  },
  "better-sleep": {
    title: "Better Sleep",
    subtitle: "Rest deeply tonight",
    initialQuery: "comprehensive sleep hygiene guide including bedtime routines, sleep environment optimization, and techniques for falling asleep faster and improving sleep quality",
    bgImage: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&h=600&fit=crop&auto=format",
    gradient: "from-indigo-700/90 via-blue-600/80 to-slate-500/70"
  },
  "mindfulness": {
    title: "Mindfulness",
    subtitle: "Be present in the moment",
    initialQuery: "introduction to mindfulness meditation including beginner techniques, body scan practices, and ways to incorporate mindfulness into everyday activities",
    bgImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop&auto=format",
    gradient: "from-emerald-600/90 via-green-500/80 to-teal-400/70"
  },
  "emotional-wellness": {
    title: "Emotional Wellness",
    subtitle: "Understand your feelings",
    initialQuery: "guide to emotional intelligence and wellness including recognizing emotions, healthy expression techniques, and building emotional resilience",
    bgImage: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&h=600&fit=crop&auto=format",
    gradient: "from-rose-600/90 via-pink-500/80 to-orange-400/70"
  },
  "mental-resilience": {
    title: "Mental Resilience",
    subtitle: "Build inner strength",
    initialQuery: "building mental resilience and psychological strength including coping strategies, growth mindset development, and techniques for bouncing back from adversity",
    bgImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=600&fit=crop&auto=format",
    gradient: "from-amber-600/90 via-orange-500/80 to-yellow-400/70"
  },
};

const sourceTypeIcons = {
  video: Video,
  book: BookOpen,
  podcast: Headphones,
  article: FileText,
};

const sourceTypeColors = {
  video: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  book: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  podcast: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  article: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

export default function LibraryTopic() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const topic = topicId ? topicData[topicId] : null;

  useEffect(() => {
    if (topic) {
      loadInitialContent();
    }
  }, [topicId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadInitialContent = async () => {
    if (!topic) return;
    
    setIsInitialLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("lumina-library", {
        body: { query: topic.initialQuery, isInitial: true },
      });

      if (error) throw error;

      setMessages([
        {
          role: "assistant",
          content: data.content || "I couldn't load the content. Please try again.",
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("Failed to load initial content:", error);
      setMessages([
        {
          role: "assistant",
          content: "I'm having trouble loading this topic. Please try refreshing the page.",
          sources: [],
        },
      ]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const context = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
      
      const { data, error } = await supabase.functions.invoke("lumina-library", {
        body: { 
          query: userMessage, 
          context,
          topicTitle: topic?.title,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content || "I couldn't find an answer. Could you rephrase your question?",
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("Failed to get response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble responding right now. Please try again.",
          sources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Topic not found</p>
          <Button variant="ghost" onClick={() => navigate("/lumina")} className="mt-4">
            Return to Lumina
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Header */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${topic.bgImage})` }}
        />
        <div className={cn("absolute inset-0 bg-gradient-to-br", topic.gradient)} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/lumina")}
          className="absolute top-4 left-4 z-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Title */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight mb-1">
            {topic.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base">{topic.subtitle}</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {isInitialLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground text-sm">Gathering insights...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto pb-24">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "animate-fade-in",
                  message.role === "user" && "flex justify-end"
                )}
              >
                {message.role === "user" ? (
                  <div className="max-w-[85%] md:max-w-[70%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* AI Response */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-6">
                        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                          Sources & Resources
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {message.sources.map((source) => {
                            const Icon = sourceTypeIcons[source.type] || FileText;
                            const colorClass = sourceTypeColors[source.type] || sourceTypeColors.article;
                            
                            return (
                              <a
                                key={source.id}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-border transition-all duration-200 hover:shadow-sm"
                              >
                                <div className={cn("p-2 rounded-lg border", colorClass)}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                    {source.title || source.domain}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                    {source.domain}
                                  </p>
                                </div>
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-1" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-6 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-2 shadow-lg">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up question..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
                disabled={isLoading || isInitialLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isInitialLoading}
                size="icon"
                className="rounded-xl shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
