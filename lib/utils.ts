// Utility function to concatenate class names conditionally
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// Utility function to get the color class for a given BMI category. Returns a default color if the category is not recognized.
export function getBMIColor(category: string): string {
  const map: Record<string, string> = {
    Underweight: "text-blue-400",
    Normal: "text-green-400",
    Overweight: "text-yellow-400",
    Obese: "text-red-400",
  };
  return map[category] ?? "text-gray-400";
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Utility function to get the color class for a given Glasgow Coma Scale score.
export function getGlasgowColor(score: number): string {
  if (score >= 13) return "text-green-400";
  if (score >= 9) return "text-yellow-400";
  return "text-red-400";
}
