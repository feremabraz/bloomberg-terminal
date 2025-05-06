"use client";

import { useEffect } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Edit, Save, X } from "lucide-react";
import { useState } from "react";
import { BloombergButton } from "./bloomberg-button";
import { bloombergColors } from "../lib/theme-config";

interface WatchlistItem {
  id: string;
  name: string;
  isSelected: boolean;
}

interface WatchlistProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  marketIndices: string[];
  onSave: (watchlist: { name: string; indices: string[] }) => void;
}

export function Watchlist({ isOpen, onClose, isDarkMode, marketIndices, onSave }: WatchlistProps) {
  const [watchlistName, setWatchlistName] = useState("New Watchlist");
  const [isEditing, setIsEditing] = useState(true);
  const [items, setItems] = useState<WatchlistItem[]>(
    marketIndices.map((index) => ({
      id: index,
      name: index,
      isSelected: false,
    }))
  );

  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  const handleToggleItem = (id: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, isSelected: !item.isSelected } : item))
    );
  };

  const handleSelectAll = () => {
    setItems(items.map((item) => ({ ...item, isSelected: true })));
  };

  const handleSelectNone = () => {
    setItems(items.map((item) => ({ ...item, isSelected: false })));
  };

  const handleSave = () => {
    const selectedIndices = items.filter((item) => item.isSelected).map((item) => item.id);
    onSave({ name: watchlistName, indices: selectedIndices });
    onClose();
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      open={true}
      className="fixed inset-0 z-50 w-full h-full p-0 m-0 max-w-none max-h-none border-none bg-transparent overflow-hidden"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      aria-labelledby="watchlist-title"
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      
      {/* Modal container - for centering */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="w-96 max-h-[80vh] border-2 shadow-lg rounded-sm overflow-hidden flex flex-col"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Input
                  value={watchlistName}
                  onChange={(e) => setWatchlistName(e.target.value)}
                  className="h-6 text-xs bg-transparent"
                  style={{ borderColor: colors.border }}
                />
              ) : (
                <h2 className="text-sm font-bold">{watchlistName}</h2>
              )}
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-500 hover:text-gray-700"
                aria-label={isEditing ? "Save name" : "Edit name"}
              >
                {isEditing ? <Save className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="p-2 border-b" style={{ borderColor: colors.border }}>
            <div className="flex gap-2">
              <BloombergButton color="green" onClick={handleSelectAll} className="text-xs">
                SELECT ALL
              </BloombergButton>
              <BloombergButton color="red" onClick={handleSelectNone} className="text-xs">
                SELECT NONE
              </BloombergButton>
            </div>
          </div>

          {/* Items list */}
          <div className="overflow-y-auto max-h-[50vh] p-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 py-1">
                <Checkbox
                  id={`watchlist-item-${item.id}`}
                  checked={item.isSelected}
                  onCheckedChange={() => handleToggleItem(item.id)}
                  className="h-3 w-3 rounded-none border-gray-500 data-[state=checked]:bg-gray-500"
                />
                <label htmlFor={`watchlist-item-${item.id}`} className="text-xs">
                  {item.name}
                </label>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-2 border-t" style={{ borderColor: colors.border }}>
            <BloombergButton color="green" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" />
              SAVE
            </BloombergButton>
          </div>
        </div>
      </div>
    </dialog>
  );
}
