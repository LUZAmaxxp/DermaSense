import { cn } from "@/lib/utils";

interface PulseRingProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export function PulseRing({ children, active = true, className }: PulseRingProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        active && "ring-2 ring-[#ba1a1a] alert-pulse",
        className
      )}
    >
      {children}
    </div>
  );
}
