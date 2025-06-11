import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[#1a1a1a] shadow-[0_0_10px_rgba(0,255,136,0.3)] border border-[#00ff88] p-6",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 text-gray-200", className)} {...props} />;
}
