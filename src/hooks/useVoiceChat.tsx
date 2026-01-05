import { useState, useCallback, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseVoiceChatReturn {
  messages: Message[];
  isLoading: boolean;
  isSpeaking: boolean;
  isRecording: boolean;
  error: string | null;
  startSession: () => Promise<void>;
  toggleRecording: () => Promise<void>;
  endSession: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useVoiceChat(): UseVoiceChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Play TTS audio using Web Speech API
  const playAudio = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      // Try to find a good female voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Female")
      ) || voices.find((v) => v.lang.startsWith("en"));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis error:", err);
      setIsSpeaking(false);
      setError("Speech synthesis failed.");
    }
  }, []);

  // Send message to Perplexity via edge function
  const sendToPerplexity = useCallback(async (currentMessages: Message[]): Promise<string> => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/lumina-voice-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ messages: currentMessages, isInitial: currentMessages.length === 0 }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Chat request failed");
    }

    const data = await response.json();
    return data.content;
  }, []);

  // Start the voice chat session
  const startSession = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      setMessages([]);
      
      // Get Lumina's opening message
      const response = await sendToPerplexity([]);
      
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages([assistantMessage]);
      
      // Play the audio
      await playAudio(response);
    } catch (err) {
      console.error("Start session error:", err);
      setError(err instanceof Error ? err.message : "Failed to start session");
    } finally {
      setIsLoading(false);
    }
  }, [sendToPerplexity, playAudio]);

  // Toggle recording (Web Speech API STT)
  const toggleRecording = useCallback(async () => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError("Speech recognition isn't supported in this browser.");
      return;
    }

    if (isRecording) {
      try {
        speechRecognitionRef.current?.stop?.();
      } catch {
        // ignore
      }
      setIsRecording(false);
      return;
    }

    setError(null);

    const recognition = new SpeechRecognitionCtor();
    speechRecognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = async (event: any) => {
      const transcript =
        event?.results?.[0]?.[0]?.transcript?.trim?.() ?? "";

      setIsRecording(false);

      if (!transcript) {
        setError("I didn't catch that—please try again.");
        return;
      }

      setIsLoading(true);

      const userMessage: Message = { role: "user", content: transcript };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      try {
        const response = await sendToPerplexity(updatedMessages);
        const assistantMessage: Message = { role: "assistant", content: response };
        setMessages((prev) => [...prev, assistantMessage]);
        await playAudio(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get response");
      } finally {
        setIsLoading(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setIsRecording(false);
      setError("Couldn't transcribe your speech. Please try again.");
    };

    try {
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Speech recognition start error:", err);
      setIsRecording(false);
      setError("Couldn't start speech recognition.");
    }
  }, [isRecording, messages, playAudio, sendToPerplexity]);

  const endSession = useCallback(() => {
    window.speechSynthesis.cancel();

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop?.();
      } catch {
        // ignore
      }
    }

    setMessages([]);
    setIsRecording(false);
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    isSpeaking,
    isRecording,
    error,
    startSession,
    toggleRecording,
    endSession,
  };
}
