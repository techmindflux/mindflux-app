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

  // Audio element ref for Cartesia playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch audio from Cartesia TTS (without playing)
  const fetchAudio = useCallback(async (text: string): Promise<HTMLAudioElement> => {
    // Stop any previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Call Cartesia TTS edge function
    const { data, error: fnError } = await supabase.functions.invoke("cartesia-tts", {
      body: { text },
    });

    if (fnError) throw fnError;
    if (!data?.audioContent) throw new Error("No audio returned");

    // Create audio from base64
    const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
    const audio = new Audio(audioSrc);
    return audio;
  }, []);

  // Play a prepared audio element
  const playPreparedAudio = useCallback(async (audio: HTMLAudioElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      audioRef.current = audio;

      audio.onended = () => {
        audioRef.current = null;
        resolve();
      };

      audio.onerror = () => {
        audioRef.current = null;
        reject(new Error("Audio playback failed"));
      };

      audio.play().catch(reject);
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

        // Fetch audio FIRST before showing text (eliminates delay)
        setState("speaking");
        const audio = await fetchAudio(aiResponse);
        
        // Add assistant message and play audio simultaneously
        const assistantMessage: Message = { role: "assistant", content: aiResponse };
        setMessages((prev) => [...prev, assistantMessage]);
        
        await playPreparedAudio(audio);

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
    [getAIResponse, fetchAudio, playPreparedAudio]
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

        // Interrupt any ongoing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
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
      
      // Fetch audio FIRST before showing text (eliminates delay)
      setState("speaking");
      const audio = await fetchAudio(greeting);
      
      // Show greeting and play audio simultaneously
      const assistantMessage: Message = { role: "assistant", content: greeting };
      setMessages([assistantMessage]);
      
      await playPreparedAudio(audio);

      // Begin always-listening mode
      startListening();
    } catch (err) {
      console.error("Start error:", err);
      setError(err instanceof Error ? err.message : "Failed to start");
      setState("idle");
      setIsActive(false);
    }
  }, [initRecognition, fetchAudio, playPreparedAudio, startListening]);

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

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
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
