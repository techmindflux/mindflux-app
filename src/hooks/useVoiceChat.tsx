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

  // Play TTS audio
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

      if (!response.ok) throw new Error("TTS failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
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
    }
  }, []);

  // Transcribe audio using STT
  const transcribe = useCallback(async (audioBase64: string): Promise<string | null> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lumina-stt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ audio: audioBase64 }),
      });

      if (!response.ok) throw new Error("STT failed");

      const data = await response.json();
      return data.text || null;
    } catch (err) {
      console.error("Transcription error:", err);
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
      body: JSON.stringify({ messages: currentMessages }),
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
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(",")[1];
            
            setIsLoading(true);
            
            // Transcribe
            const transcript = await transcribe(base64);
            
            if (transcript) {
              // Add user message
              const userMessage: Message = { role: "user", content: transcript };
              const updatedMessages = [...messages, userMessage];
              setMessages(updatedMessages);
              
              // Get AI response
              try {
                const response = await sendToPerplexity(updatedMessages);
                const assistantMessage: Message = { role: "assistant", content: response };
                setMessages(prev => [...prev, assistantMessage]);
                
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
          }
        });
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus"
        });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(100);
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
