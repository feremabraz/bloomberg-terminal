import { useState } from "react";
import { atom, useAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import type { MarketItem } from "../types";

// Define Jotai atoms for AI state
export const aiMarketCommentsAtom = atom<string>("");
export const aiMarketQuestionsAtom = atom<Array<{ role: "user" | "assistant", content: string }>>([]);
export const aiLoadingAtom = atom<boolean>(false);

export function useAiMarketAnalysis() {
  const [aiComments, setAiComments] = useAtom(aiMarketCommentsAtom);
  const [aiMessages, setAiMessages] = useAtom(aiMarketQuestionsAtom);
  const [isLoading, setIsLoading] = useAtom(aiLoadingAtom);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Function to generate market commentary
  const generateMarketCommentary = async (
    selectedSecurity: MarketItem | undefined,
    benchmarkSecurity: MarketItem | undefined
  ) => {
    if (!selectedSecurity || !benchmarkSecurity) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const marketData = {
        selectedSecurity,
        benchmarkSecurity,
      };
      
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: "Provide a brief market commentary on the selected security compared to the benchmark." }
          ],
          marketData,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate AI commentary");
      }
      
      const data = await response.json();
      setAiComments(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error generating AI commentary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to ask a question about the market data
  const askMarketQuestion = async (
    question: string,
    selectedSecurity: MarketItem | undefined,
    benchmarkSecurity: MarketItem | undefined
  ) => {
    if (!selectedSecurity || !benchmarkSecurity || !question.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Add user question to messages
    const updatedMessages = [
      ...aiMessages,
      { role: "user" as const, content: question }
    ];
    setAiMessages(updatedMessages);
    
    try {
      const marketData = {
        selectedSecurity,
        benchmarkSecurity,
      };
      
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          marketData,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }
      
      const data = await response.json();
      
      // Add AI response to messages
      setAiMessages([
        ...updatedMessages,
        { role: "assistant" as const, content: data.response }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error asking AI question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear conversation history
  const clearConversation = () => {
    setAiMessages([]);
  };

  return {
    aiComments,
    aiMessages,
    isLoading,
    error,
    generateMarketCommentary,
    askMarketQuestion,
    clearConversation,
  };
}
