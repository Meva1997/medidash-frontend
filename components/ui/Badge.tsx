// components/ui/Badge.tsx

interface BadgeProps {
  children: React.ReactNode;
  variant?: "High" | "Moderate" | "Low" | "Default";
  className?: string;
}

export function Badge({
  children,
  variant = "Default",
  className = "",
}: BadgeProps) {
  const variants = {
    Default: "bg-gray-800 text-gray-300 border-gray-700",
    High: "bg-red-950 text-red-400 border-red-900",
    Moderate: "bg-yellow-950 text-yellow-400 border-yellow-900",
    Low: "bg-blue-950 text-blue-400 border-blue-900",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
