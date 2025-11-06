import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <svg
        className={cn("animate-spin text-blue-600", sizes[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

// Full page loading spinner
export const FullPageLoader: React.FC<{ text?: string }> = ({
  text = "読み込み中...",
}) => {
  return (
    <div className="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-white">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
};

// Inline loading text
export const LoadingText: React.FC<{ text?: string }> = ({
  text = "読み込み中...",
}) => {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <LoadingSpinner size="sm" />
      <span className="text-gray-600">{text}</span>
    </div>
  );
};
