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
  const isProcessingRef = useRef(false);
  const isSpeakingRef = useRef(false);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition not supported in this browser");
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
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

        utter.onstart = () => {
          isSpeakingRef.current = true;
        };
        utter.onend = () => {
          isSpeakingRef.current = false;
          resolve();
        };
        utter.onerror = (e) => {
          isSpeakingRef.current = false;
          reject(new Error((e as any)?.error || "Speech synthesis failed"));
        };

        window.speechSynthesis.speak(utter);
      } catch (err) {
        isSpeakingRef.current = false;
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

  // Process a single turn: listen → think → speak → listen again
  const processTurn = useCallback(async () => {
    if (!recognitionRef.current || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setState("listening");

    try {
      // Listen for user input
      const userText = await new Promise<string>((resolve, reject) => {
        const recognition = recognitionRef.current!;

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };

        recognition.onerror = (event) => {
          if (event.error === "no-speech") {
            resolve(""); // Empty means no speech detected
          } else {
            reject(new Error(`Speech error: ${event.error}`));
          }
        };

        recognition.onend = () => {
          // If no result was triggered, resolve empty
        };

        recognition.start();
      });

      if (!userText.trim()) {
        // No speech detected, restart listening
        isProcessingRef.current = false;
        if (isActive) {
          setTimeout(() => processTurn(), 500);
        }
        return;
      }

      // Add user message
      const userMessage: Message = { role: "user", content: userText };
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      setState("thinking");
      const aiResponse = await getAIResponse(
        userText,
        messages // Use current messages state
      );

      // Add assistant message
      const assistantMessage: Message = { role: "assistant", content: aiResponse };
      setMessages((prev) => [...prev, assistantMessage]);

      // Speak the response
      setState("speaking");
      await playAudio(aiResponse);

      // Continue listening
      isProcessingRef.current = false;
      if (isActive) {
        processTurn();
      }
    } catch (err) {
      console.error("Turn error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      isProcessingRef.current = false;
      setState("idle");
    }
  }, [getAIResponse, playAudio, messages, isActive]);

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

      // Speak greeting
      setState("speaking");
      await playAudio(greeting);

      // Start listening loop
      processTurn();
    } catch (err) {
      console.error("Start error:", err);
      setError(err instanceof Error ? err.message : "Failed to start");
      setState("idle");
      setIsActive(false);
    }
  }, [initRecognition, playAudio, processTurn]);

  // Stop conversation
  const stop = useCallback(() => {
    setIsActive(false);
    isProcessingRef.current = false;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;

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
