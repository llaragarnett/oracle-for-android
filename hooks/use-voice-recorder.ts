/**
 * useVoiceRecorder Hook
 * Handles audio recording and voice input for Oracle chat
 */

import { useEffect, useState, useRef, useCallback } from "react";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  AudioRecorder,
} from "expo-audio";

export interface VoiceRecorderState {
  isRecording: boolean;
  isTranscribing: boolean;
  transcribedText: string;
  error: string | null;
  recordingDuration: number;
}

export function useVoiceRecorder() {
  const audioRecorder: AudioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 500);

  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isTranscribing: false,
    transcribedText: "",
    error: null,
    recordingDuration: 0,
  });

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio permissions and mode
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Request microphone permission
        const permissionStatus = await requestRecordingPermissionsAsync();
        if (!permissionStatus.granted) {
          setState((prev) => ({
            ...prev,
            error: "Microphone permission denied",
          }));
          return;
        }

        // Set audio mode for recording
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Failed to initialize audio: ${error}`,
        }));
      }
    };

    initializeAudio();

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        error: null,
        recordingDuration: 0,
        transcribedText: "",
      }));

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      setState((prev) => ({
        ...prev,
        isRecording: true,
      }));

      // Track recording duration
      let duration = 0;
      durationIntervalRef.current = setInterval(() => {
        duration += 100;
        setState((prev) => ({
          ...prev,
          recordingDuration: duration,
        }));
      }, 100) as unknown as NodeJS.Timeout;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to start recording: ${error}`,
        isRecording: false,
      }));
    }
  }, [audioRecorder]);

  /**
   * Stop recording and transcribe audio
   */
  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        await audioRecorder.stop();

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isTranscribing: true,
        }));

        const recordingUri = audioRecorder.uri;
        if (!recordingUri) {
          throw new Error("No recording URI available");
        }

        // TODO: Send to backend for transcription via tRPC
        // For now, use placeholder
        const transcribedText = `[Voice message: ${formatDuration(state.recordingDuration)}]`;

        setState((prev) => ({
          ...prev,
          isTranscribing: false,
          transcribedText: transcribedText,
        }));

        resolve(transcribedText);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isRecording: false,
          isTranscribing: false,
          error: `Failed to stop recording: ${error}`,
        }));
        reject(error);
      }
    });
  }, [audioRecorder, state.recordingDuration]);

  /**
   * Cancel recording without transcribing
   */
  const cancelRecording = useCallback(async () => {
    try {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      await audioRecorder.stop();

      setState((prev) => ({
        ...prev,
        isRecording: false,
        recordingDuration: 0,
        transcribedText: "",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to cancel recording: ${error}`,
      }));
    }
  }, [audioRecorder]);

  /**
   * Clear transcribed text
   */
  const clearTranscription = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcribedText: "",
    }));
  }, []);

  /**
   * Format recording duration for display (MM:SS)
   */
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return {
    // State
    isRecording: recorderState.isRecording,
    isTranscribing: state.isTranscribing,
    transcribedText: state.transcribedText,
    error: state.error,
    recordingDuration: state.recordingDuration,

    // Actions
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscription,
    formatDuration,
  };
}
