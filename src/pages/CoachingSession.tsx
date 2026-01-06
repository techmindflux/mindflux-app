import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { X, Send, Lock, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CheckInData {
  category: string;
  feelings: string[];
}

const MAX_MESSAGES = 15;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function CoachingSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const checkInData = location.state as CheckInData | null;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [coachMessageCount, setCoachMessageCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasStarted = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Start session with opening message
  useEffect(() => {
    if (hasStarted.current || !checkInData) return;
    hasStarted.current = true;
    
    const startSession = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/coaching-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            messages: [],
            checkInData,
            messageCount: 0,
          }),
        });

        if (!response.ok) throw new Error("Failed to start session");

        const data = await response.json();
        
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        };
        
        setMessages([assistantMessage]);
        setCoachMessageCount(1);
      } catch (error) {
        console.error("Failed to start session:", error);
        const fallbackMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Based on your check-in showing ${checkInData.feelings.join(", ")}, let's examine what's actually happening. Is this feeling more about external pressure or internal resistance?`,
          timestamp: new Date(),
        };
        setMessages([fallbackMessage]);
        setCoachMessageCount(1);
      } finally {
        setIsLoading(false);
      }
    };

    startSession();
  }, [checkInData]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || isSessionEnded) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${SUPABASE_URL}/functions/v1/coaching-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          messages: conversationHistory,
          checkInData,
          messageCount: coachMessageCount,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const newCount = coachMessageCount + 1;
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCoachMessageCount(newCount);
      
      // Check if session should end
      if (newCount >= MAX_MESSAGES || 
          data.content.toLowerCase().includes("session is complete") ||
          data.content.toLowerCase().includes("we've gone far enough") ||
          data.content.toLowerCase().includes("let it integrate")) {
        setIsSessionEnded(true);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
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

  const endSession = () => {
    navigate("/home");
  };

  const getCategoryColor = () => {
    switch (checkInData?.category) {
      case "overwhelmed": return "from-rose-500 to-red-500";
      case "activated": return "from-amber-400 to-orange-400";
      case "drained": return "from-sky-400 to-blue-500";
      case "grounded": return "from-emerald-400 to-green-500";
      default: return "from-primary to-primary/80";
    }
  };

  if (!checkInData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-4">No check-in data found</p>
          <Button onClick={() => navigate("/check-in/manual")}>Start Check-in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getCategoryColor()} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-sm font-medium">L</span>
            </div>
            <div>
              <h1 className="text-foreground font-medium text-base">Coaching Session</h1>
              <p className="text-muted-foreground text-xs">
                {coachMessageCount}/{MAX_MESSAGES} messages
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={endSession}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 pt-28 pb-24 px-4 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Session Context */}
          <div className="flex justify-center mb-6">
            <div className="bg-muted/50 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
              Feeling: {checkInData.feelings.slice(0, 3).join(", ")}
              {checkInData.feelings.length > 3 && ` +${checkInData.feelings.length - 3}`}
            </div>
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`
                  max-w-[85%] rounded-2xl px-4 py-3
                  ${message.role === "user"
                    ? "bg-foreground text-background rounded-br-md"
                    : "bg-muted/80 text-foreground rounded-bl-md"
                  }
                `}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-[10px] mt-1.5 ${message.role === "user" ? "text-background/50" : "text-muted-foreground"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted/80 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-4 pb-8">
        <div className="max-w-lg mx-auto">
          {isSessionEnded ? (
            <div className="flex items-center justify-center gap-3 py-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Session complete</p>
              <Button onClick={endSession} size="sm" variant="outline" className="ml-2">
                Return Home
              </Button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-muted/50 rounded-2xl">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response..."
                  disabled={isLoading}
                  rows={1}
                  className="w-full bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-32"
                  style={{ minHeight: "44px" }}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className={`
                  h-11 w-11 rounded-full transition-all duration-200
                  ${inputValue.trim() 
                    ? `bg-gradient-to-br ${getCategoryColor()} text-white hover:opacity-90` 
                    : "bg-muted text-muted-foreground"
                  }
                `}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {!isSessionEnded && coachMessageCount >= 12 && (
            <p className="text-center text-muted-foreground text-xs mt-2">
              Session nearing end • {MAX_MESSAGES - coachMessageCount} messages remaining
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
