import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper function to conditionally join class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Bloomberg terminal color scheme
export const bloombergColors = {
  dark: {
    background: "#121212",
    surface: "#1e1e1e",
    header: "#000000",
    text: "#ffffff",
    textSecondary: "#888888",
    accent: "#ff9900",
    border: "#333333",
    positive: "#4CAF50",
    negative: "#F44336",
    sparklineGray: "#666666",
  },
  light: {
    background: "#f0f0f0",
    surface: "#e0e0e0",
    header: "#d0d0d0",
    text: "#000000",
    textSecondary: "#555555",
    accent: "#ff9900",
    border: "#cccccc",
    positive: "#4CAF50",
    negative: "#F44336",
    sparklineGray: "#888888",
  },
};
