import { Button } from "@/components/ui/button";
import type React from "react";
import { cn } from "../lib/theme-config";

interface BloombergButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: "red" | "green" | "accent" | "default";
  className?: string;
}

export function BloombergButton({
  children,
  color = "default",
  className,
  ...props
}: BloombergButtonProps) {
  const colorClasses = {
    red: "bg-red-600 hover:bg-red-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    accent: "bg-amber-500 hover:bg-amber-600 text-black",
    default: "bg-gray-600 hover:bg-gray-700 text-white",
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-6 px-2 py-0 text-xs font-mono rounded-none border border-gray-700",
        colorClasses[color],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
