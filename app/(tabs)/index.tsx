import { useState } from "react";
import { View } from "react-native";
import { OraclePanel } from "@/components/oracle-panel";
import { trpc } from "@/lib/trpc";
import { useScreenVision } from "@/hooks/use-screen-vision";

export default function HomeScreen() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; image?: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const familyMemberId = 1;
  const conversationId = "default-conversation";

  const { data: loadedMessages } = trpc.chat.getHistory.useQuery({
    conversationId,
    limit: 50,
  });

  if (loadedMessages && messages.length === 0) {
    setMessages(
      loadedMessages.map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }))
    );
  }

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  const handleSendMessage = async (text: string) => {
    const userMessage = {
      role: "user" as const,
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        familyMemberId,
        conversationId,
        content: text,
      });

      let responseText = "";
      if (typeof response.oracleResponse === "string") {
        responseText = response.oracleResponse;
      } else if (Array.isArray(response.oracleResponse)) {
        const textContent = response.oracleResponse.find(
          (item: any) => item.type === "text" || typeof item === "string"
        );
        responseText =
          typeof textContent === "string"
            ? textContent
            : (textContent as any)?.text || (textContent as any)?.content || "";
      } else if (typeof response.oracleResponse === "object" && response.oracleResponse) {
        const obj = response.oracleResponse as any;
        responseText = obj.text || obj.content || obj.message || "";
      }
      
      if (!responseText) {
        responseText = "I received your message but couldn't formulate a response.";
      }

      const oracleMessage = {
        role: "assistant" as const,
        content: responseText,
      };
      setMessages((prev) => [...prev, oracleMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const { captureScreen } = useScreenVision();

  const handleScreenCapture = async () => {
    const screenshot = await captureScreen();
    if (screenshot) {
      return screenshot;
    }
    return null;
  };

  return (
    <View className="flex-1 bg-background">
      <OraclePanel
        messages={messages}
        isLoading={isLoading || sendMessageMutation.isPending}
        onSendMessage={handleSendMessage}
        onScreenCapture={handleScreenCapture}
      />
    </View>
  );
}
