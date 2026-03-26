import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function ProgressBar({ value = 0, max = 100, className, variant = "primary", showLabel = false, label }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantStyles = {
    primary: "from-primary to-primary-dim",
    secondary: "from-secondary-fixed to-secondary",
    tertiary: "from-tertiary-fixed-dim to-tertiary",
    gold: "from-secondary-fixed to-secondary-dim",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          <span className="font-label text-label-md text-on-surface-variant uppercase">
            {label}
          </span>
          <span className="font-label text-label-lg text-on-surface">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            variantStyles[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export { ProgressBar };
