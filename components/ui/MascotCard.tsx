"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const mascotCardVariants = cva(
  "relative flex items-start gap-4 rounded-2xl p-5 border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-muted/50 border-border",
        success: "bg-accent-light/50 border-accent",
        encourage: "bg-primary-light/30 border-primary-light",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface MascotCardProps extends VariantProps<typeof mascotCardVariants> {
  emoji: string;
  message: string;
  className?: string;
}

export function MascotCard({
  emoji,
  message,
  variant,
  className,
}: MascotCardProps) {
  return (
    <div className={cn(mascotCardVariants({ variant }), className)}>
      {/* Mascot emoji */}
      <div className="flex-shrink-0 text-4xl animate-bounce-slow" role="img">
        {emoji}
      </div>

      {/* Speech bubble */}
      <div className="relative flex-1">
        <div
          className={cn(
            "bg-white rounded-xl rounded-tl-sm px-4 py-3 shadow-soft",
            "border border-border/50"
          )}
        >
          <p className="text-sm text-foreground/90 font-medium leading-relaxed">
            {message}
          </p>
        </div>
        {/* Speech bubble tail */}
        <div className="absolute top-3 -left-1.5 w-3 h-3 bg-white border-l border-b border-border/50 rotate-45" />
      </div>
    </div>
  );
}
