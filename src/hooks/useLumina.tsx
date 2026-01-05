import { useState, useCallback, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseLuminaReturn {
  messages: Message[];
  isLoading: boolean;
  isSpeaking: boolean;
  questionCount: number;
  isComplete: boolean;
  sendMessage: (text: string) => Promise<void>;
  startConversation: () => Promise<void>;
  playAudio: (text: string) => Promise<void>;
  error: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useLumina(): UseLuminaReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lumina-tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsSpeaking(false);
      // Don't set error - audio is optional enhancement
    }
  }, []);

  const sendToLumina = useCallback(async (currentMessages: Message[], count: number): Promise<string> => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/lumina-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: currentMessages,
        questionCount: count,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Chat request failed");
    }

    const data = await response.json();
    return data.content;
  }, []);

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      setMessages([]);
      setQuestionCount(0);
      setIsComplete(false);
      
      // Get Lumina's opening message
      const response = await sendToLumina([], 0);
      
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages([assistantMessage]);
      setQuestionCount(1);
      
      // Play the audio
      await playAudio(response);
    } catch (err) {
      console.error("Start conversation error:", err);
      setError(err instanceof Error ? err.message : "Failed to start conversation");
    } finally {
      setIsLoading(false);
    }
  }, [sendToLumina, playAudio]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      const userMessage: Message = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      const newCount = questionCount + 1;
      
      // Get Lumina's response
      const response = await sendToLumina(updatedMessages, newCount);
      
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);
      setQuestionCount(newCount);
      
      // Check if conversation should end (after 3 questions or if response seems like a closing)
      if (newCount >= 3 || response.toLowerCase().includes("come back") || response.toLowerCase().includes("enough for now")) {
        setIsComplete(true);
      }
      
      // Play the audio
      await playAudio(response);
    } catch (err) {
      console.error("Send message error:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  }, [messages, questionCount, sendToLumina, playAudio]);

  return {
    messages,
    isLoading,
    isSpeaking,
    questionCount,
    isComplete,
    sendMessage,
    startConversation,
    playAudio,
    error,
  };
}
