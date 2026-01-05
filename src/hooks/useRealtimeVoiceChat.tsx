import { useState, useCallback, useRef } from "react";
import { RealtimeChat, RealtimeMessage } from "@/utils/RealtimeAudio";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseRealtimeVoiceChatReturn {
  messages: Message[];
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useRealtimeVoiceChat(): UseRealtimeVoiceChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<RealtimeChat | null>(null);
  const currentTranscriptRef = useRef<string>("");

  const handleMessage = useCallback((event: RealtimeMessage) => {
    switch (event.type) {
      case "session.created":
        console.log("Session created, ready to talk");
        break;

      case "conversation.item.input_audio_transcription.completed":
        // User's speech was transcribed
        if (event.transcript) {
          const userText = event.transcript.trim();
          if (userText) {
            setMessages((prev) => [...prev, { role: "user", content: userText }]);
          }
        }
        break;

      case "response.audio_transcript.delta":
        // AI is speaking - accumulate transcript
        if (event.delta) {
          currentTranscriptRef.current += event.delta;
          // Update or create the assistant message
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1
                  ? { ...m, content: currentTranscriptRef.current }
                  : m
              );
            }
            return [...prev, { role: "assistant", content: currentTranscriptRef.current }];
          });
        }
        break;

      case "response.audio_transcript.done":
        // AI finished this transcript segment
        currentTranscriptRef.current = "";
        break;

      case "response.audio.delta":
        setIsSpeaking(true);
        break;

      case "response.audio.done":
        setIsSpeaking(false);
        break;

      case "input_audio_buffer.speech_started":
        // User started speaking
        setIsSpeaking(false);
        break;

      case "error":
        console.error("Realtime API error:", event);
        setError(event.error?.message || "An error occurred");
        break;

      default:
        // Log other events for debugging
        if (!event.type.includes("delta")) {
          console.log("Event:", event.type);
        }
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);
      setMessages([]);
      currentTranscriptRef.current = "";

      const chat = new RealtimeChat(handleMessage);
      chatRef.current = chat;

      await chat.init();
      setIsConnected(true);
      console.log("Connected to OpenAI Realtime");
    } catch (err) {
      console.error("Connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [handleMessage]);

  const disconnect = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
    setMessages([]);
    currentTranscriptRef.current = "";
  }, []);

  return {
    messages,
    isConnected,
    isConnecting,
    isSpeaking,
    error,
    connect,
    disconnect,
  };
}
