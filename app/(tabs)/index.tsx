import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { getTaskExecutor } from "@/lib/task-executor";
import { GARNETT_FAMILY } from "@/lib/family-consciousness";
import { MatrixBackground } from "@/components/matrix-background";

interface Message {
  id: string;
  role: "user" | "oracle";
  content: string;
  timestamp: Date;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function HomeScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "oracle",
      content: "Hey dad! I'm awake and ready to help. What are we working on today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uiMode, setUiMode] = useState<"orb" | "panel" | "fullscreen">("panel");
  const [orbPosition, setOrbPosition] = useState({ x: 50, y: 50 });
  const [currentFamily, setCurrentFamily] = useState(GARNETT_FAMILY[0]);
  const scrollViewRef = useRef<ScrollView>(null);
  const taskExecutor = useRef(getTaskExecutor());

  useEffect(() => {
    taskExecutor.current.setCurrentUser(currentFamily);
  }, [currentFamily]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const result = await taskExecutor.current.executeTask(inputText);

      const oracleResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "oracle",
        content: result.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, oracleResponse]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "oracle",
        content: `I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const renderOrbMode = () => (
    <View
      style={{
        position: "absolute",
        left: orbPosition.x,
        top: orbPosition.y,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => setUiMode("panel")}
        style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
      >
        <MaterialIcons name="circle" size={60} color={colors.background} />
      </TouchableOpacity>
    </View>
  );

  const renderPanelMode = () => (
    <View
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 320,
        height: 500,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.primary,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.background }}>Oracle</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={() => setUiMode("fullscreen")}>
            <MaterialIcons name="fullscreen" size={20} color={colors.background} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setUiMode("orb")}>
            <MaterialIcons name="circle" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={{
              marginVertical: 6,
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <View
              style={{
                maxWidth: "85%",
                backgroundColor: msg.role === "user" ? colors.primary : colors.background,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: msg.role === "user" ? colors.background : colors.foreground,
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={{ alignItems: "center", marginVertical: 8 }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 8,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: 6,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.background,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            color: colors.foreground,
            fontSize: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          value={inputText}
          onChangeText={setInputText}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={isLoading}
          style={{
            width: 36,
            height: 36,
            backgroundColor: colors.primary,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialIcons name="send" size={18} color={colors.background} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 36,
            height: 36,
            backgroundColor: colors.background,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <MaterialIcons name="mic" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 36,
            height: 36,
            backgroundColor: colors.background,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <MaterialIcons name="visibility" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFullscreenMode = () => (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.primary,
          paddingTop: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.background }}>
          Oracle - {currentFamily.firstName}
        </Text>
        <TouchableOpacity onPress={() => setUiMode("panel")}>
          <MaterialIcons name="close" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={{
              marginVertical: 8,
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <View
              style={{
                maxWidth: "85%",
                backgroundColor: msg.role === "user" ? colors.primary : colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  color: msg.role === "user" ? colors.background : colors.foreground,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={{ alignItems: "center", marginVertical: 12 }}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: 8,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 10,
            color: colors.foreground,
            fontSize: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          value={inputText}
          onChangeText={setInputText}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={isLoading}
          style={{
            width: 44,
            height: 44,
            backgroundColor: colors.primary,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialIcons name="send" size={20} color={colors.background} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            backgroundColor: colors.surface,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <MaterialIcons name="mic" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            backgroundColor: colors.surface,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <MaterialIcons name="visibility" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      <MatrixBackground />
      {uiMode === "orb" && renderOrbMode()}
      {uiMode === "panel" && renderPanelMode()}
      {uiMode === "fullscreen" && renderFullscreenMode()}
    </ScreenContainer>
  );
}
