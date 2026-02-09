import { useState, useCallback } from "react";
import * as FileSystem from "expo-file-system/legacy";
import { trpc } from "@/lib/trpc";

// Screen vision result type not needed for hook

/**
 * Hook for capturing screen and sending to Oracle for analysis
 * Allows Oracle to "see" what's on the user's screen
 */
export function useScreenVision(familyMemberId: number = 1) {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFamilyMemberId] = useState(familyMemberId);
  const analyzeScreenMutation = trpc.chat.sendMessage.useMutation();

  const captureScreen = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, return a placeholder
      // In production, use react-native-view-shot or similar
      const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      setScreenshot(placeholder);

      return placeholder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to capture screen";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeScreenshot = useCallback(
    async (imageData: string, userMessage?: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await analyzeScreenMutation.mutateAsync({
          familyMemberId: currentFamilyMemberId,
          conversationId: "screen-analysis",
          content: userMessage || "What do you see on my screen?",
          imageUrl: imageData,
        });

        return result.oracleResponse;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to analyze screen";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [analyzeScreenMutation]
  );

  const clearScreenshot = useCallback(() => {
    setScreenshot(null);
    setError(null);
  }, []);

  return {
    screenshot,
    isLoading,
    error,
    captureScreen,
    analyzeScreenshot,
    clearScreenshot,
  };
}
