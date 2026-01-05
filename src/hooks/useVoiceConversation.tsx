import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ConversationState = "idle" | "listening" | "thinking" | "speaking";

interface UseVoiceConversationReturn {
  messages: Message[];
  state: ConversationState;
  error: string | null;
  start: () => void;
  stop: () => void;
  isActive: boolean;
}

export function useVoiceConversation(): UseVoiceConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<ConversationState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const messagesRef = useRef<Message[]>([]);
  const isActiveRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Initialize speech recognition with continuous listening
  const initRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition not supported in this browser");
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    return recognition;
  }, []);

  // Speak via Web Speech (reliable fallback when TTS providers fail)
  const playAudio = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!("speechSynthesis" in window)) {
          reject(new Error("Text-to-speech not supported in this browser"));
          return;
        }

        // Cancel any previous utterances
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.95;
        utter.pitch = 1.0;
        utter.volume = 1.0;

        utter.onend = () => {
          resolve();
        };
        utter.onerror = (e) => {
          reject(new Error((e as any)?.error || "Speech synthesis failed"));
        };

        window.speechSynthesis.speak(utter);
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  // Get AI response
  const getAIResponse = useCallback(
    async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
      const allMessages = [...conversationHistory, { role: "user" as const, content: userMessage }];

      const { data, error: fnError } = await supabase.functions.invoke("lumina-voice-chat", {
        body: { messages: allMessages, isInitial: false },
      });

      if (fnError) throw fnError;
      if (!data?.content) throw new Error("No response from AI");

      return data.content;
    },
    []
  );

  // Process user speech and respond
  const processUserInput = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      // Add user message
      const userMessage: Message = { role: "user", content: userText };
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      setState("thinking");
      try {
        const aiResponse = await getAIResponse(userText, messagesRef.current);

        // Add assistant message
        const assistantMessage: Message = { role: "assistant", content: aiResponse };
        setMessages((prev) => [...prev, assistantMessage]);

        // Speak the response
        setState("speaking");
        await playAudio(aiResponse);

        // Resume listening after speaking
        if (isActiveRef.current && recognitionRef.current) {
          setState("listening");
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started, ignore
          }
        }
      } catch (err) {
        console.error("Response error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        // Resume listening on error too
        if (isActiveRef.current && recognitionRef.current) {
          setState("listening");
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started
          }
        }
      }
    },
    [getAIResponse, playAudio]
  );

  // Start continuous listening
  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      // Get the latest result
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript;

      if (transcript.trim()) {
        // Pause listening while processing
        try {
          recognition.stop();
        } catch (e) {
          // May already be stopped
        }

        // Interrupt any ongoing speech
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }

        // Process the input
        processUserInput(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        // Normal, just restart
        if (isActiveRef.current) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              // Already started
            }
          }, 100);
        }
      } else {
        console.error("Speech error:", event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still active and not processing
      if (isActiveRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            // Already started
          }
        }, 100);
      }
    };

    setState("listening");
    try {
      recognition.start();
    } catch (e) {
      // Already started
    }
  }, [processUserInput]);

  // Start conversation
  const start = useCallback(async () => {
    setError(null);
    setMessages([]);
    setIsActive(true);

    const recognition = initRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;

    // Get initial greeting
    try {
      setState("thinking");
      const { data, error: fnError } = await supabase.functions.invoke("lumina-voice-chat", {
        body: { messages: [], isInitial: true },
      });

      if (fnError) throw fnError;

      const greeting = data?.content || "Hi there! How are you feeling today?";
      const assistantMessage: Message = { role: "assistant", content: greeting };
      setMessages([assistantMessage]);

      // Speak greeting then start continuous listening
      setState("speaking");
      await playAudio(greeting);

      // Begin always-listening mode
      startListening();
    } catch (err) {
      console.error("Start error:", err);
      setError(err instanceof Error ? err.message : "Failed to start");
      setState("idle");
      setIsActive(false);
    }
  }, [initRecognition, playAudio, startListening]);

  // Stop conversation
  const stop = useCallback(() => {
    setIsActive(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setState("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    messages,
    state,
    error,
    start,
    stop,
    isActive,
  };
}
