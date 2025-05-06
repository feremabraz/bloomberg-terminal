"use client";

import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { type ReactNode, useEffect, useState } from "react";
import { errorAtom, isDarkModeAtom } from "../atoms";
import { useTerminalUI } from "../hooks";
import { KeyboardShortcuts } from "../core/keyboard-shortcuts";
import { bloombergColors } from "../lib/theme-config";
import { ShortcutIndicator } from "../core/shortcut-indicator";

type TerminalLayoutProps = {
  children: ReactNode;
  shortcuts: Array<{
    key: string;
    ctrlKey?: boolean;
    action: () => void;
    description: string;
  }>;
};

export function TerminalLayout({ children, shortcuts }: TerminalLayoutProps) {
  // Use Jotai atoms directly instead of props
  const [isDarkMode, setIsDarkMode] = useAtom(isDarkModeAtom);
  const [error, setError] = useAtom(errorAtom);
  const { handleThemeToggle } = useTerminalUI();

  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  // Apply theme to body
  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    document.body.classList.toggle("light", !isDarkMode);

    // Add event listener for theme toggle
    const handleThemeToggle = () => {
      setIsDarkMode(!isDarkMode);
    };

    document.addEventListener("toggle-theme", handleThemeToggle);

    return () => {
      document.removeEventListener("toggle-theme", handleThemeToggle);
    };
  }, [isDarkMode, setIsDarkMode]);

  return (
    <div className={`min-h-screen font-mono bg-[${colors.background}] text-[${colors.text}]`}>
      {children}

      {/* Keyboard shortcuts */}
      <KeyboardShortcuts shortcuts={shortcuts} isEnabled={true} />

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-500 text-white text-xs fixed bottom-0 left-0 right-0 z-50">
          Error: {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-4 text-white hover:bg-red-600"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Shortcut indicator */}
      <ShortcutIndicator isDarkMode={isDarkMode} />
    </div>
  );
}
