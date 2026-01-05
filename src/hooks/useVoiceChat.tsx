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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const recorderMimeRef = useRef<string>("audio/webm");

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

  // Transcribe audio using STT
  const transcribe = useCallback(async (audioBase64: string, mimeType: string): Promise<string | null> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lumina-stt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ audio: audioBase64, mimeType }),
      });

      if (!response.ok) throw new Error("STT failed");

      const data = await response.json();
      return data.text || null;
    } catch (err) {
      console.error("Transcription error:", err);
      setError("Couldn't transcribe your audio. Please try again.");
      return null;
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

  // Toggle recording
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        setIsRecording(false);
        return;
      }

      return new Promise<void>((resolve) => {
        mediaRecorder.onstop = async () => {
          const mimeType = recorderMimeRef.current || "audio/webm";
          const blob = new Blob(chunksRef.current, { type: mimeType });
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());

          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(",")[1];

            setIsLoading(true);

            // Transcribe
            const transcript = await transcribe(base64, mimeType);

            if (transcript) {
              // Add user message
              const userMessage: Message = { role: "user", content: transcript };
              const updatedMessages = [...messages, userMessage];
              setMessages(updatedMessages);

              // Get AI response
              try {
                const response = await sendToPerplexity(updatedMessages);
                const assistantMessage: Message = { role: "assistant", content: response };
                setMessages((prev) => [...prev, assistantMessage]);

                // Play response
                await playAudio(response);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to get response");
              }
            }

            setIsLoading(false);
            resolve();
          };
          reader.readAsDataURL(blob);
        };

        mediaRecorder.stop();
        setIsRecording(false);
      });
    } else {
      // Start recording
      try {
        setError(null);
        chunksRef.current = [];

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]; // mp4 for Safari
        const supported = preferred.find((t) => (MediaRecorder as any).isTypeSupported?.(t));
        const mimeType = supported || "";
        recorderMimeRef.current = mimeType || "audio/webm";

        const mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(250);
        setIsRecording(true);
      } catch (err) {
        setError("Could not access microphone. Please check permissions.");
        console.error("Microphone access error:", err);
      }
    }
  }, [isRecording, messages, transcribe, sendToPerplexity, playAudio]);

  // End session
  const endSession = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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
