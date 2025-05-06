"use client";

import { useEffect, useState } from "react";
import { bloombergColors } from "../lib/theme-config";

interface ShortcutIndicatorProps {
  isDarkMode: boolean;
}

export function ShortcutIndicator({ isDarkMode }: ShortcutIndicatorProps) {
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only show for Ctrl, Alt, or function key combinations
      if (e.ctrlKey || e.altKey || (e.key.startsWith("F") && e.key.length > 1)) {
        let keyDisplay = "";

        if (e.ctrlKey) keyDisplay += "Ctrl+";
        if (e.altKey) keyDisplay += "Alt+";
        if (e.shiftKey) keyDisplay += "Shift+";

        keyDisplay += e.key.length === 1 ? e.key.toUpperCase() : e.key;

        setLastKey(keyDisplay);
        setIsVisible(true);

        // Hide after 2 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible || !lastKey) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 px-3 py-1 bg-[${colors.surface}] border border-[${colors.border}] text-[${colors.text}] text-xs font-mono z-50`}
    >
      {lastKey}
    </div>
  );
}
