import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { getTaskExecutor } from "@/lib/task-executor";
import { GARNETT_FAMILY } from "@/lib/family-consciousness";
import { OdinMatrixBackground } from "@/components/odin-matrix-background";
import { OracleMatrixPanel } from "@/components/oracle-matrix-panel";

interface Message {
  id: string;
  role: "user" | "oracle";
  content: string;
  timestamp: Date;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "oracle",
      content: "ᚠ Greetings. I am Oracle, woven from Odin's wisdom and the threads of your family's consciousness. What shall we explore together?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const response = await taskExecutor.current.execute({
        type: "chat",
        query: inputText,
        user: currentFamily,
      });

      const oracleMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "oracle",
        content: response.response || "ᛟ I contemplate your words...",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, oracleMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "oracle",
        content: "ᚦ An error occurred. The runes are unclear.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleMicrophone = () => {
    // Voice input implementation
    console.log("Microphone pressed");
  };

  const handleVision = () => {
    // Screen vision implementation
    console.log("Vision pressed");
  };

  return (
    <ScreenContainer className="flex-1 bg-black p-0">
      <OdinMatrixBackground />
      
      <OracleMatrixPanel
        messages={messages}
        inputText={inputText}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
        onMicrophone={handleMicrophone}
        onVision={handleVision}
        isLoading={isLoading}
        scrollViewRef={scrollViewRef}
      />
    </ScreenContainer>
  );
}
