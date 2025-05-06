"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { BloombergButton } from "./bloomberg-button";
import { bloombergColors } from "../lib/theme-config";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDarkMode: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "YES",
  cancelText = "NO",
  isDarkMode,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      } else if (e.key === "Enter" && isOpen) {
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleBackdropClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog
      open={true}
      className="fixed inset-0 z-50 w-full h-full p-0 m-0 max-w-none max-h-none border-none bg-transparent overflow-hidden"
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      aria-labelledby="modal-title"
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      
      {/* Modal container - for centering */}
      <div className="relative w-full h-full flex items-center justify-center">
      <div
        ref={modalRef}
        className="w-80 border-2 p-4 shadow-lg rounded-sm"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-sm font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-6 text-xs">{message}</p>
        <div className="flex justify-end space-x-2">
          <BloombergButton color="red" onClick={onClose}>
            {cancelText}
          </BloombergButton>
          <BloombergButton color="green" onClick={onConfirm}>
            {confirmText}
          </BloombergButton>
        </div>
      </div>
      </div>
    </dialog>
  );
}
