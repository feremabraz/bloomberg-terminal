/**
 * API route to initialize the scheduler
 * This gets called automatically when the app starts
 */

import refreshMarketData from "@/lib/market-data-refresh";
import scheduler from "@/lib/scheduler";
import { NextResponse } from "next/server";

// Import the scheduler to ensure it's initialized
import "@/lib/market-data-refresh";

export async function GET() {
  try {
    // Get the status of all registered tasks
    const tasks = Array.from(Object.values(scheduler)).filter(
      (item) => typeof item === "object" && item !== null
    );

    return NextResponse.json({
      status: "Scheduler initialized",
      registeredTasks: tasks.length,
      message: "Market data refresh scheduler is running",
    });
  } catch (error) {
    console.error("Error initializing scheduler:", error);
    return NextResponse.json({ error: "Failed to initialize scheduler" }, { status: 500 });
  }
}

// This is a no-op POST handler to keep the route alive in development
export async function POST() {
  return NextResponse.json({ status: "ok" });
}
