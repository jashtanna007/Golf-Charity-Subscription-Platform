import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-label text-label-md rounded-full px-3 py-1 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-container text-on-surface",
        primary: "bg-primary-container text-on-primary-container",
        secondary: "bg-secondary-container text-on-secondary-container",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        success: "bg-primary-container text-on-primary-container",
        warning: "bg-secondary-container text-on-secondary-container",
        error: "bg-error-container text-on-error-container",
        outline: "border border-outline-variant text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
