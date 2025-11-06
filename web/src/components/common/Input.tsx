import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, fullWidth = false, className, id, ...props },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "rounded-lg border px-3 py-2 transition-colors",
            "focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none",
            "disabled:cursor-not-allowed disabled:bg-gray-100",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
            fullWidth && "w-full",
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
