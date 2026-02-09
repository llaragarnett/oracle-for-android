import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  PanResponder,
  Animated,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";
import { VoiceInputButton } from "./voice-input-button";
import { IconSymbol } from "./ui/icon-symbol";

type PanelMode = "panel" | "orb" | "fullscreen";

interface OraclePanelProps {
  messages: Array<{ role: "user" | "assistant"; content: string; image?: string }>;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onScreenCapture?: () => Promise<string>;
}

export function OraclePanel({
  messages,
  onSendMessage,
  isLoading = false,
  onScreenCapture,
}: OraclePanelProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<PanelMode>("panel");
  const [inputText, setInputText] = useState("");
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 100 });
  const [orbPosition, setOrbPosition] = useState({ x: 20, y: 200 });
  const [showScreenshot, setShowScreenshot] = useState<string | null>(null);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (mode === "orb") {
          setOrbPosition({
            x: Math.max(0, orbPosition.x + gestureState.dx),
            y: Math.max(0, orbPosition.y + gestureState.dy),
          });
        }
      },
    })
  ).current;

  const handleScreenCapture = async () => {
    if (onScreenCapture) {
      try {
        const screenshot = await onScreenCapture();
        setShowScreenshot(screenshot);
      } catch (error) {
        console.error("Failed to capture screen:", error);
      }
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  // Panel Mode - Full draggable panel
  if (mode === "panel") {
    return (
      <View
        style={{
          position: "absolute",
          top: panelPosition.y,
          left: panelPosition.x,
          width: 320,
          height: 500,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: 0.95,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.background, fontSize: 16, fontWeight: "bold" }}>
            Oracle
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* Screen Vision Button */}
            <Pressable
              onPress={handleScreenCapture}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
              })}
            >
              <IconSymbol name="eye.fill" size={20} color={colors.background} />
            </Pressable>

            {/* Fullscreen Button */}
            <Pressable
              onPress={() => setMode("fullscreen")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
              })}
            >
              <IconSymbol name="arrow.up.left.and.arrow.down.right" size={20} color={colors.background} />
            </Pressable>

            {/* Collapse to Orb */}
            <Pressable
              onPress={() => setMode("orb")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
              })}
            >
              <IconSymbol name="minus" size={20} color={colors.background} />
            </Pressable>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          style={{
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colors.background,
          }}
          contentContainerStyle={{ gap: 8 }}
        >
          {messages.map((msg, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  maxWidth: "80%",
                  backgroundColor: msg.role === "user" ? colors.primary : colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    color: msg.role === "user" ? colors.background : colors.foreground,
                    fontSize: 14,
                  }}
                >
                  {msg.content}
                </Text>
                {msg.image && (
                  <Image
                    source={{ uri: msg.image }}
                    style={{ width: 150, height: 150, borderRadius: 8, marginTop: 8 }}
                  />
                )}
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={{ alignItems: "center", paddingVertical: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Oracle is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Screenshot Display */}
        {showScreenshot && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              padding: 8,
              maxHeight: 100,
            }}
          >
            <Image
              source={{ uri: showScreenshot }}
              style={{ width: "100%", height: 80, borderRadius: 8 }}
            />
          </View>
        )}

        {/* Input Area */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: colors.background,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                paddingVertical: 8,
                minHeight: 40,
              }}
            >
              <Text
                style={{
                  color: inputText ? colors.foreground : colors.muted,
                  fontSize: 14,
                }}
              >
                {inputText || "Ask Oracle..."}
              </Text>
            </View>
            <Pressable
              onPress={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 8,
              })}
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
            </Pressable>
          </View>
            <VoiceInputButton onTranscribed={setInputText} />
        </View>
      </View>
    );
  }

  // Orb Mode - Small draggable bubble
  if (mode === "orb") {
    return (
      <View
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          top: orbPosition.y,
          left: orbPosition.x,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Pressable
          onPress={() => setMode("panel")}
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <IconSymbol name="sparkles" size={40} color={colors.background} />
        </Pressable>
      </View>
    );
  }

  // Fullscreen Mode
  if (mode === "fullscreen") {
    return (
      <Modal visible transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.background, fontSize: 18, fontWeight: "bold" }}>
              Oracle
            </Text>
            <Pressable
              onPress={() => setMode("panel")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 8,
              })}
            >
              <IconSymbol name="xmark" size={24} color={colors.background} />
            </Pressable>
          </View>

          {/* Messages */}
          <ScrollView
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
            contentContainerStyle={{ gap: 12 }}
          >
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    maxWidth: "85%",
                    backgroundColor: msg.role === "user" ? colors.primary : colors.surface,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      color: msg.role === "user" ? colors.background : colors.foreground,
                      fontSize: 16,
                      lineHeight: 24,
                    }}
                  >
                    {msg.content}
                  </Text>
                  {msg.image && (
                    <Image
                      source={{ uri: msg.image }}
                      style={{ width: "100%", height: 300, borderRadius: 12, marginTop: 12 }}
                    />
                  )}
                </View>
              </View>
            ))}
            {isLoading && (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <Text style={{ color: colors.muted, fontSize: 14 }}>Oracle is thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                alignItems: "flex-end",
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  minHeight: 44,
                }}
              >
                <Text
                  style={{
                    color: inputText ? colors.foreground : colors.muted,
                    fontSize: 16,
                  }}
                >
                  {inputText || "Ask Oracle..."}
                </Text>
              </View>
              <Pressable
                onPress={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  padding: 8,
                })}
              >
                <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
              </Pressable>
            </View>
            <VoiceInputButton onTranscribed={setInputText} />
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}
