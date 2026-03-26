import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function StatsCard({ icon: Icon, label, value, subtext, trend, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("stat-card", className)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
          <Icon className="w-5 h-5 text-on-primary-container" strokeWidth={1.5} />
        </div>
        {trend && (
          <span
            className={cn(
              "font-label text-label-md px-2 py-0.5 rounded-full",
              trend > 0
                ? "bg-primary-container text-on-primary-container"
                : "bg-error-container text-on-error-container"
            )}
          >
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className="font-headline text-headline-md text-on-surface">{value}</p>
      <p className="font-label text-label-md text-on-surface-variant uppercase mt-1">{label}</p>
      {subtext && (
        <p className="text-body-sm text-on-surface-variant mt-2">{subtext}</p>
      )}
    </motion.div>
  );
}

export default StatsCard;
