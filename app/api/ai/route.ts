import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Message, CoreMessage } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "./rate-limit";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const runtime = "edge";

// Define validation schema for request body
const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().max(4000),
    })
  ).max(20), // Limit number of messages
  marketData: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Check rate limits first
    const rateLimitResult = await rateLimit(req, {
      maxRequests: 20, // 20 requests per minute per IP
      windowInSeconds: 60,
    });

    // If rate limit exceeded, return 429 Too Many Requests
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          reset: rateLimitResult.reset,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // Get request origin
    const origin = req.headers.get("origin") || "";
    
    // Restrict to specific origins
    const allowedOrigins = ["https://bloomberg-terminal-nine.vercel.app"];
    
    // In development, also allow localhost origins
    if (process.env.NODE_ENV === "development") {
      allowedOrigins.push("http://localhost:3000");
    }
    
    if (!allowedOrigins.includes(origin)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized origin" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format", 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, marketData } = validationResult.data;
    
    // Sanitize market data to prevent injection
    const sanitizedMarketData = marketData ? 
      JSON.stringify(marketData).slice(0, 5000) : // Limit size
      "{}";
    
    const systemPrompt = `You are an AI financial analyst for a Bloomberg Terminal clone.
You provide concise, insightful commentary and answer questions about market data.
Current market data context: ${sanitizedMarketData}
Keep responses brief, professional, and focused on financial insights.
Never provide investment advice or make specific trading recommendations.`;
    
    // Prepend the system message to the messages array and ensure correct typing
    const messagesWithSystem: CoreMessage[] = [
      { role: "system", content: systemPrompt } as CoreMessage,
      ...messages.map(m => ({ role: m.role, content: m.content }) as CoreMessage)
    ];
    
    // Use the AI SDK to stream text with strict limits
    const result = streamText({
      model: openai("gpt-4"),
      messages: messagesWithSystem,
      temperature: 0.7,
      maxTokens: 500, // Strict token limit
    });
    
    // Return the stream with rate limit headers
    const response = result.toDataStreamResponse();
    response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString());
    
    return response;
  } catch (error) {
    console.error("AI API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate AI response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
