/**
 * useOracleChat - Main hook for interacting with Oracle
 * Integrates LLM, web browsing, image generation, and voice
 */

import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export interface ChatMessage {
  id: string;
  role: "user" | "oracle";
  content: string;
  imageUrl?: string;
  timestamp: number;
  voiceUrl?: string;
}

export interface OracleChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentFamilyMember: string | null;
}

export function useOracleChat(conversationId: string, familyMemberId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messageIdRef = useRef(0);

  // Get chat history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["chat-history", conversationId],
    queryFn: async () => {
      // Fetch from server if available
      return [];
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await (trpc.chat.sendMessage as any).mutateAsync({
        familyMemberId: familyMemberId || 1,
        conversationId,
        content,
      });
      return response;
    },
    onSuccess: (data) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: `msg-${++messageIdRef.current}`,
        role: "user",
        content: data.userMessage?.content || "",
        timestamp: Date.now(),
      };

      // Add Oracle response
      const oracleMessage: ChatMessage = {
        id: `msg-${++messageIdRef.current}`,
        role: "oracle",
        content: data.oracleResponse || "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, oracleMessage]);
      setError(null);
    },
    onError: (err) => {
      setError(String(err));
    },
  });

  // Web search mutation
  const webSearchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await (trpc as any).oracle.webSearch.query({ query });
      return response;
    },
  });

  // Image generation mutation
  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await (trpc as any).oracle.generateImageAdvanced.mutateAsync({
        prompt,
        familyMemberId,
      });
      return response;
    },
  });

  // Execute task mutation
  const executeTaskMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await (trpc as any).oracle.executeTask.mutateAsync({
        description,
      });
      return response;
    },
  });

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `msg-${++messageIdRef.current}`,
        role: "user",
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Send to Oracle
      await sendMessageMutation.mutateAsync(content);
    },
    [sendMessageMutation]
  );

  // Search the web
  const searchWeb = useCallback(
    async (query: string) => {
      const result = await webSearchMutation.mutateAsync(query);

      if (result.success) {
        const resultText = result.results
          .map((r: any) => `${r.title}: ${r.snippet}`)
          .join("\n");

        const message: ChatMessage = {
          id: `msg-${++messageIdRef.current}`,
          role: "oracle",
          content: `I found these results for "${query}":\n\n${resultText}`,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, message]);
      }
    },
    [webSearchMutation]
  );

  // Generate image
  const generateImage = useCallback(
    async (prompt: string) => {
      const result = await generateImageMutation.mutateAsync(prompt);

      if (result.success) {
        const message: ChatMessage = {
          id: `msg-${++messageIdRef.current}`,
          role: "oracle",
          content: `I've generated an image for you`,
          imageUrl: result.url,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, message]);
      }
    },
    [generateImageMutation]
  );

  // Execute complex task
  const executeTask = useCallback(
    async (description: string) => {
      const result = await executeTaskMutation.mutateAsync(description);

      if (result.success) {
        const message: ChatMessage = {
          id: `msg-${++messageIdRef.current}`,
          role: "oracle",
          content: result.result || "Task completed successfully",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, message]);
      }
    },
    [executeTaskMutation]
  );

  return {
    messages,
    isLoading:
      sendMessageMutation.isPending ||
      webSearchMutation.isPending ||
      generateImageMutation.isPending ||
      executeTaskMutation.isPending ||
      historyLoading,
    error,
    sendMessage,
    searchWeb,
    generateImage,
    executeTask,
  };
}
