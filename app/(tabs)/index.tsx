import { useState } from "react";
import { View } from "react-native";
import { FloatingOrb } from "@/components/floating-orb";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<
    Array<{ id: string; text: string; sender: "user" | "oracle" }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const familyMemberId = 1;
  const conversationId = "default-conversation";

  // Use trpc query hook to load messages
  const { data: loadedMessages } = trpc.chat.getHistory.useQuery({
    conversationId,
    limit: 50,
  });

  // Update messages when loaded
  if (loadedMessages && messages.length === 0) {
    setMessages(
      loadedMessages.map((msg: any) => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.sender === "user" ? "user" : "oracle",
      }))
    );
  }

  // Use trpc mutation hook for sending messages
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  const handleSendMessage = async (text: string) => {
    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: "user" as const,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        familyMemberId,
        conversationId,
        content: text,
      });

      // Extract text from response, handling arrays and objects
      let responseText = "";
      if (typeof response.oracleResponse === "string") {
        responseText = response.oracleResponse;
      } else if (Array.isArray(response.oracleResponse)) {
        // If array of content objects, extract text from first text item
        const textContent = response.oracleResponse.find(
          (item: any) => item.type === "text" || typeof item === "string"
        );
        responseText =
          typeof textContent === "string"
            ? textContent
            : (textContent as any)?.text || (textContent as any)?.content || "";
      } else if (typeof response.oracleResponse === "object" && response.oracleResponse) {
        // If object, try to extract text field
        const obj = response.oracleResponse as any;
        responseText = obj.text || obj.content || obj.message || "";
      }
      
      // Fallback if still empty
      if (!responseText) {
        responseText = "I received your message but couldn't formulate a response.";
      }

      const oracleMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "oracle" as const,
      };
      setMessages((prev) => [...prev, oracleMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "oracle" as const,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryPress = () => {
    router.push("/(tabs)/gallery");
  };

  const handleSettingsPress = () => {
    router.push("/(tabs)/settings");
  };

  return (
    <View className="flex-1 bg-background">
      <FloatingOrb
        messages={messages}
        isLoading={isLoading || sendMessageMutation.isPending}
        onSendMessage={handleSendMessage}
        onGalleryPress={handleGalleryPress}
        onSettingsPress={handleSettingsPress}
      />
    </View>
  );
}
