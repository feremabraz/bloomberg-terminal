"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { BloombergButton } from "../core/bloomberg-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Send, RefreshCw, X } from "lucide-react";
import type { MarketData } from "../types";

interface GeneralMarketAnalysisProps {
  marketData: MarketData;
  colors: {
    background: string;
    surface: string;
    text: string;
    border: string;
    accent: string;
    positive: string;
    negative: string;
  };
}

export function GeneralMarketAnalysis({ 
  marketData, 
  colors 
}: GeneralMarketAnalysisProps) {
  // Use the AI SDK's useChat hook for streaming responses
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    error, 
    setMessages
  } = useChat({
    api: "/api/ai",
    // Include market data in the request
    body: {
      marketData: {
        fullMarketData: marketData
      }
    },
    id: "general-market-analysis",
  });
  
  // Generate market overview
  const generateMarketOverview = () => {
    setMessages([{
      id: "system-1",
      role: "system",
      content: "You are an AI financial analyst. Provide a brief market overview."
    }, {
      id: "user-1",
      role: "user",
      content: "Provide a brief overview of the current market conditions based on the data provided."
    }]);
  };
  
  // Clear conversation
  const clearChat = () => {
    setMessages([]);
  };
  
  return (
    <div className="p-4 border rounded-sm mt-6" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold">AI Market Analysis</h3>
        <div className="flex gap-2">
          <BloombergButton 
            color="accent" 
            onClick={generateMarketOverview}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            MARKET OVERVIEW
          </BloombergButton>
          
          {messages.length > 0 && (
            <BloombergButton 
              color="red" 
              onClick={clearChat}
              disabled={isLoading}
              className="flex items-center gap-1 text-xs"
            >
              <X className="h-3 w-3" />
              CLEAR
            </BloombergButton>
          )}
        </div>
      </div>
      
      {/* AI Commentary Section */}
      <div 
        className="p-3 mb-4 border rounded-sm text-xs" 
        style={{ 
          borderColor: colors.border, 
          backgroundColor: colors.background,
          minHeight: "80px"
        }}
      >
        {isLoading && messages.length === 0 ? (
          <Skeleton className="h-16 w-full" />
        ) : error ? (
          <p className="text-xs" style={{ color: colors.negative }}>
            Error: {error.message}. Please try again.
          </p>
        ) : messages.length > 0 && messages[messages.length - 1].role === "assistant" ? (
          <p className="text-xs whitespace-pre-line">
            {messages[messages.length - 1].content}
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            Click MARKET OVERVIEW to generate AI commentary on current market conditions, or ask a specific question below.
          </p>
        )}
      </div>
      
      {/* Question and Answer Section */}
      <div className="mb-4">
        <h4 className="text-xs font-bold mb-2">Ask About Market Data</h4>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about market trends, top performers, sectors, etc."
            className="flex-1 h-8 text-xs font-mono rounded-none border focus:ring-0 focus:ring-offset-0"
            style={{ 
              backgroundColor: colors.background, 
              borderColor: colors.border,
              color: colors.text
            }}
            disabled={isLoading}
          />
          <BloombergButton 
            type="submit" 
            color="accent" 
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-1 text-xs"
          >
            <Send className="h-3 w-3" />
            ASK
          </BloombergButton>
        </form>
      </div>
      
      {/* Conversation History */}
      {messages.length > 1 && (
        <div 
          className="p-3 border rounded-sm text-xs max-h-[200px] overflow-y-auto"
          style={{ 
            borderColor: colors.border, 
            backgroundColor: colors.background
          }}
        >
          {messages.map((message) => (
            message.role !== "system" && (
              <div key={message.id} className="mb-2 last:mb-0">
                <p 
                  className="font-bold text-xs mb-1"
                  style={{ 
                    color: message.role === "user" ? colors.accent : colors.text 
                  }}
                >
                  {message.role === "user" ? "You" : "AI Assistant"}:
                </p>
                <p className="text-xs whitespace-pre-line pl-2">{message.content}</p>
              </div>
            )
          ))}
          {isLoading && (
            <div className="mt-2">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
