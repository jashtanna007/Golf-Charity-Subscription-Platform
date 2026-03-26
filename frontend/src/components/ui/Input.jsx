import { cn } from "@/lib/utils";
import { useState } from "react";

function Input({ className, label, error, type = "text", id, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "block font-label text-label-md uppercase tracking-wider transition-colors duration-200",
            focused ? "text-primary" : "text-on-surface-variant",
            error && "text-error"
          )}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={cn(
          "input-field",
          error && "border-error focus:border-error focus:ring-error/10",
          className
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <p className="text-body-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
}

function Textarea({ className, label, error, id, rows = 4, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "block font-label text-label-md uppercase tracking-wider transition-colors duration-200",
            focused ? "text-primary" : "text-on-surface-variant"
          )}
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={cn(
          "input-field resize-none",
          error && "border-error focus:border-error focus:ring-error/10",
          className
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <p className="text-body-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
}

export { Input, Textarea };
