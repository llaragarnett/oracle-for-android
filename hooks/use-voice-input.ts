import { useState, useCallback } from "react";
import * as Speech from "expo-speech";

export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSpeaking: boolean;
}

export function useVoiceInput() {
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: "",
    error: null,
    isSpeaking: false,
  });

  const startListening = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isListening: true, error: null }));

      // Note: On mobile, we'd use expo-speech-recognition
      // For now, this is a placeholder for the actual implementation
      // In production, integrate with expo-speech-recognition or native modules

      setState((prev) => ({ ...prev, isListening: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setState((prev) => ({ ...prev, error: errorMessage, isListening: false }));
    }
  }, []);

  const stopListening = useCallback(() => {
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const speak = useCallback(async (text: string) => {
    try {
      setState((prev) => ({ ...prev, isSpeaking: true }));
      await Speech.speak(text, {
        language: "en",
        rate: 1.0,
        pitch: 1.0,
      });
      setState((prev) => ({ ...prev, isSpeaking: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setState((prev) => ({ ...prev, error: errorMessage, isSpeaking: false }));
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: "" }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    clearTranscript,
  };
}
