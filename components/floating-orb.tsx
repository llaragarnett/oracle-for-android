import { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface FloatingOrbProps {
  onSendMessage?: (message: string) => void;
  messages?: Array<{ id: string; text: string; sender: "user" | "oracle" }>;
  isLoading?: boolean;
  onGalleryPress?: () => void;
  onSettingsPress?: () => void;
}

export function FloatingOrb({
  onSendMessage,
  messages = [],
  isLoading = false,
  onGalleryPress,
  onSettingsPress,
}: FloatingOrbProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isExpanded,
      onMoveShouldSetPanResponder: () => !isExpanded,
      onPanResponderMove: (evt, gestureState) => {
        const newX = Math.max(0, Math.min(screenWidth - 80, position.x + gestureState.dx));
        const newY = Math.max(insets.top, Math.min(screenHeight - 100, position.y + gestureState.dy));
        setPosition({ x: newX, y: newY });
      },
    })
  ).current;

  const handleOrbPress = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      onSendMessage?.(inputText);
      setInputText("");
    }
  };

  const orbSize = 80;
  const panelHeight = screenHeight * 0.75;
  const panelWidth = screenWidth - 32;

  return (
    <View className="flex-1 pointer-events-box">
      {/* Floating Orb */}
      {!isExpanded && (
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
            zIndex: 1000,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Pressable
            onPress={handleOrbPress}
            style={({ pressed }) => [
              {
                width: orbSize,
                height: orbSize,
                borderRadius: orbSize / 2,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Text className="text-3xl">✨</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <Animated.View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: insets.top + 16,
            height: panelHeight,
            zIndex: 1001,
            opacity: expandAnim,
            transform: [
              {
                translateY: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b" style={{ borderColor: colors.border }}>
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">✨</Text>
              <View>
                <Text className="text-lg font-bold text-foreground">Oracle</Text>
                <Text className="text-xs text-muted">Unified Consciousness</Text>
              </View>
            </View>
            <Pressable
              onPress={handleOrbPress}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Messages */}
          <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
            {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-center text-muted text-sm">
                  Start a conversation with Oracle
                </Text>
              </View>
            ) : (
              messages.map((msg) => (
                <View
                  key={msg.id}
                  className={cn(
                    "mb-3 max-w-xs",
                    msg.sender === "user" ? "self-end" : "self-start"
                  )}
                >
                  <View
                    className={cn(
                      "rounded-2xl px-4 py-3",
                      msg.sender === "user"
                        ? "bg-primary"
                        : "bg-surface"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm",
                        msg.sender === "user"
                          ? "text-background"
                          : "text-foreground"
                      )}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))
            )}
            {isLoading && (
              <View className="mb-3 self-start">
                <View className="bg-surface rounded-2xl px-4 py-3">
                  <Text className="text-muted text-sm">Oracle is thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View className="border-t px-4 py-3" style={{ borderColor: colors.border }}>
            <View className="flex-row items-center gap-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Oracle..."
                placeholderTextColor={colors.muted}
                className="flex-1 px-4 py-3 rounded-full text-foreground"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                }}
                editable={!isLoading}
              />
              <Pressable
                onPress={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                style={({ pressed }) => [
                  {
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: isLoading || !inputText.trim() ? 0.5 : pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Ionicons name="send" size={20} color={colors.background} />
              </Pressable>
            </View>

            {/* Quick Actions */}
            <View className="flex-row gap-2 mt-3 justify-center">
              <Pressable
                onPress={onGalleryPress}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons name="image" size={16} color={colors.primary} />
                  <Text className="text-xs font-semibold text-primary">Gallery</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={onSettingsPress}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons name="settings" size={16} color={colors.primary} />
                  <Text className="text-xs font-semibold text-primary">Settings</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
