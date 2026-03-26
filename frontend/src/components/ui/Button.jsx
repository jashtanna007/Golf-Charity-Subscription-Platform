import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-label text-label-lg rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "gradient-primary text-white shadow-elevation-1 hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-surface-container-highest text-on-surface border border-outline-variant/20 hover:bg-surface-container-high hover:shadow-elevation-1 active:scale-[0.98]",
        tertiary: "text-primary hover:text-primary-dim underline-offset-4 hover:underline",
        outline: "border border-outline-variant text-on-surface hover:bg-surface-container hover:border-primary/30",
        danger: "bg-error text-on-error hover:bg-error/90 shadow-elevation-1",
        ghost: "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        gold: "gradient-secondary text-white shadow-elevation-1 hover:shadow-glow-secondary hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-body-sm",
        md: "h-10 px-5 text-body-md",
        lg: "h-12 px-8 text-body-lg",
        xl: "h-14 px-10 text-title-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

function Button({ className, variant, size, children, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export { Button, buttonVariants };
