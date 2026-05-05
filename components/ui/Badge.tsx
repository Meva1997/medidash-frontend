interface BadgeProps {
  children: React.ReactNode;
  variant?: "high" | "moderate" | "low" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants: Record<string, string> = {
    default:  "bg-gray-800/60 text-gray-400 border-white/10",
    high:     "bg-red-500/10 text-red-400 border-red-500/20",
    moderate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
