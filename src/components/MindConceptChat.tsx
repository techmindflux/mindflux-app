import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { MindConcept } from "./MindConceptCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MindConceptChatProps {
  concept: MindConcept;
  isOpen: boolean;
  onClose: () => void;
}

export function MindConceptChat({ concept, isOpen, onClose }: MindConceptChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mind-concept-chat", {
        body: {
          concept: concept.title,
          conceptExplanation: concept.explanation,
          messages: [],
        },
      });

      if (error) throw error;

      setMessages([{ role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setMessages([{
        role: "assistant",
        content: `Let's explore how "${concept.title}" shows up in your life. Take a moment to think... When was the last time you felt this way? What was happening around you?`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("mind-concept-chat", {
        body: {
          concept: concept.title,
          conceptExplanation: concept.explanation,
          messages: newMessages,
        },
      });

      if (error) throw error;

      setMessages([...newMessages, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "I'm having trouble connecting right now. Let's try again in a moment." }
      ]);
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

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => setMessages([]), 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Chat Panel */}
      <div className={cn(
        "relative flex flex-col h-full bg-background",
        "animate-slide-up"
      )}>
        {/* Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{concept.title}</h2>
            <p className="text-xs text-muted-foreground">Exploring with Lumina</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Concept context card */}
          <div className="glass-card p-4 border-l-2 border-primary/50">
            <p className="text-xs text-muted-foreground italic">
              {concept.explanation}
            </p>
          </div>

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
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex items-end gap-3">
            <div className="flex-1 glass-card p-1 rounded-2xl">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts..."
                rows={1}
                className={cn(
                  "w-full bg-transparent px-4 py-3 text-sm resize-none",
                  "placeholder:text-muted-foreground/50 focus:outline-none",
                  "max-h-32"
                )}
                style={{ minHeight: "44px" }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                "bg-primary text-primary-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:bg-primary/90 transition-all duration-200",
                "active:scale-95"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
