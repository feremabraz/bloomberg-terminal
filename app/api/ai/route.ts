import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, marketData } = await req.json();
    
    const systemPrompt = `You are an AI financial analyst for a Bloomberg Terminal clone.
You provide concise, insightful commentary and answer questions about market data.
Current market data context: ${JSON.stringify(marketData)}
Keep responses brief, professional, and focused on financial insights.`;
    
    // Prepend the system message to the messages array
    const messagesWithSystem = [
      { role: "system", content: systemPrompt },
      ...messages
    ];
    
    // Use the AI SDK to stream text
    const result = streamText({
      model: openai("gpt-4"),
      messages: messagesWithSystem,
      temperature: 0.7,
      maxTokens: 500,
    });
    
    // Return the stream using the toDataStreamResponse method
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate AI response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
