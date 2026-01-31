import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Message {
  id: string;
  sender: "user" | "oracle";
  content: string;
  imageUrl?: string;
  timestamp: number;
}

export default function ChatScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [familyMemberId, setFamilyMemberId] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const getHistoryQuery = trpc.chat.getHistory.useQuery(
    { conversationId, limit: 50 },
    { enabled: !!conversationId }
  );

  // Initialize on component mount
  useEffect(() => {
    const initializeChat = async () => {
      // Generate a unique conversation ID
      const convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(convId);

      // Try to get the selected family member from storage
      const savedMemberId = await AsyncStorage.getItem("selectedFamilyMemberId");
      if (savedMemberId) {
        setFamilyMemberId(parseInt(savedMemberId));
      }

      // Load message history if available
      const savedMessages = await AsyncStorage.getItem(`messages_${convId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    };

    initializeChat();
  }, []);

  // Update messages when history is loaded
  useEffect(() => {
    if (getHistoryQuery.data) {
      const formattedMessages = getHistoryQuery.data.map((msg, idx) => ({
        id: `msg_${idx}`,
        sender: msg.sender as "user" | "oracle",
        content: msg.content,
        imageUrl: msg.imageUrl || undefined,
        timestamp: new Date(msg.createdAt).getTime(),
      }));
      setMessages(formattedMessages);
    }
  }, [getHistoryQuery.data]);

  // Save messages to AsyncStorage
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      AsyncStorage.setItem(`messages_${conversationId}`, JSON.stringify(messages));
    }
  }, [messages, conversationId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !familyMemberId || !conversationId) {
      return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: "user",
      content: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        familyMemberId,
        conversationId,
        content: inputText,
      });

      const oracleMessage: Message = {
        id: `msg_${Date.now()}_oracle`,
        sender: "oracle",
        content: response.oracleResponse as string,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, oracleMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        sender: "oracle",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";

    return (
      <View
        className={cn(
          "mb-3 flex-row",
          isUser ? "justify-end pr-4" : "justify-start pl-4"
        )}
      >
        <View
          className={cn(
            "max-w-xs rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary rounded-br-none"
              : "bg-surface rounded-bl-none border border-border"
          )}
        >
          <Text
            className={cn(
              "text-base leading-relaxed",
              isUser ? "text-background" : "text-foreground"
            )}
          >
            {item.content}
          </Text>

          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              className="mt-2 h-40 w-40 rounded-lg"
              resizeMode="cover"
            />
          )}

          <Text
            className={cn(
              "mt-1 text-xs",
              isUser ? "text-background opacity-70" : "text-muted"
            )}
          >
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenContainer className="flex-1 bg-background">
        {!familyMemberId ? (
          <View className="flex-1 items-center justify-center gap-4">
            <Text className="text-xl font-bold text-foreground">
              Select a Family Member
            </Text>
            <Text className="text-center text-muted">
              Go to Settings to select which family member you are
            </Text>
          </View>
        ) : (
          <>
            {/* Messages List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 16 }}
              onEndReachedThreshold={0.1}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center">
                  <Text className="text-center text-muted">
                    Start a conversation with Oracle
                  </Text>
                </View>
              }
            />

            {/* Input Area */}
            <View className="border-t border-border bg-background px-4 py-4">
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Message Oracle..."
                  placeholderTextColor={colors.muted}
                  className="flex-1 rounded-full border border-border bg-surface px-4 py-3 text-foreground"
                  editable={!isLoading}
                  multiline
                  maxLength={500}
                />

                <TouchableOpacity
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className={cn(
                    "rounded-full p-3",
                    inputText.trim() && !isLoading ? "bg-primary" : "bg-muted opacity-50"
                  )}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.background} size="small" />
                  ) : (
                    <Text className="text-background font-bold">↑</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
