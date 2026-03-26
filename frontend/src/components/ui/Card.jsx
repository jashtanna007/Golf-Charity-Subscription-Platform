import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function Card({ className, hover = true, children, ...props }) {
  const Component = hover ? motion.div : "div";
  const motionProps = hover
    ? {
        whileHover: { y: -2, boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)" },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={cn(
        "bg-white rounded-xl shadow-elevation-1 overflow-hidden",
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}

function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("px-6 pt-6 pb-2", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn("font-headline text-headline-sm text-on-surface", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn("text-body-md text-on-surface-variant mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
}

function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("px-6 pb-6 pt-2", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn("px-6 pb-6 pt-0 flex items-center gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
