/**
 * VoiceInputButton Component
 * Microphone button for recording voice messages in chat
 */

import { useState, useEffect } from "react";
import { Pressable, View, Text, Animated } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onTranscribed: (text: string) => void;
  isLoading?: boolean;
}

export function VoiceInputButton({ onTranscribed, isLoading = false }: VoiceInputButtonProps) {
  const colors = useColors();
  const voice = useVoiceRecorder();
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation for recording indicator
  useEffect(() => {
    if (voice.isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [voice.isRecording, pulseAnim]);

  const handleStartRecording = async () => {
    setShowRecordingUI(true);
    await voice.startRecording();
  };

  const handleStopRecording = async () => {
    try {
      const transcribedText = await voice.stopRecording();
      if (transcribedText) {
        onTranscribed(transcribedText);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    } finally {
      setShowRecordingUI(false);
    }
  };

  const handleCancel = async () => {
    await voice.cancelRecording();
    setShowRecordingUI(false);
  };

  // Recording UI
  if (voice.isRecording || showRecordingUI) {
    return (
      <View className="flex-row items-center gap-2">
        {/* Recording indicator */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
          className="w-3 h-3 rounded-full bg-error"
        />

        {/* Duration display */}
        <Text className="text-sm font-medium text-muted">
          {voice.formatDuration(voice.recordingDuration)}
        </Text>

        {/* Stop button */}
        <Pressable
          onPress={handleStopRecording}
          disabled={voice.isTranscribing}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          className="px-3 py-2 rounded-full bg-success"
        >
          <MaterialIcons name="stop" size={20} color={colors.background} />
        </Pressable>

        {/* Cancel button */}
        <Pressable
          onPress={handleCancel}
          disabled={voice.isTranscribing}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          className="px-3 py-2 rounded-full bg-muted"
        >
          <MaterialIcons name="close" size={20} color={colors.background} />
        </Pressable>
      </View>
    );
  }

  // Transcribing UI
  if (voice.isTranscribing) {
    return (
      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-muted">Transcribing...</Text>
      </View>
    );
  }

  // Error state
  if (voice.error) {
    return (
      <View className="flex-row items-center gap-2">
        <Text className="text-xs text-error">{voice.error}</Text>
        <Pressable
          onPress={() => voice.clearTranscription()}
          className="px-2 py-1"
        >
          <MaterialIcons name="close" size={16} color={colors.error} />
        </Pressable>
      </View>
    );
  }

  // Normal microphone button
  return (
    <Pressable
      onPress={handleStartRecording}
      disabled={isLoading}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      className={cn(
        "p-2 rounded-full",
        isLoading ? "bg-muted opacity-50" : "bg-primary"
      )}
    >
      <MaterialIcons
        name="mic"
        size={24}
        color={colors.background}
      />
    </Pressable>
  );
}
