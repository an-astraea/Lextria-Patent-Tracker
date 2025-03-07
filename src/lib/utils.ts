
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date strings for display in a user-friendly format
export function formatDate(date: string | null | undefined): string {
  if (!date) return "Not Filed Yet";
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Get deadline status: 'overdue', 'upcoming', or 'none'
export function getDeadlineStatus(deadline: string | null): 'overdue' | 'upcoming' | 'none' {
  if (!deadline) return 'none';
  
  const deadlineDate = new Date(deadline);
  const today = new Date();
  
  // Clear time part for accurate date comparison
  today.setHours(0, 0, 0, 0);
  
  if (deadlineDate < today) {
    return 'overdue';
  } else {
    return 'upcoming';
  }
}

// Get days until deadline (negative for overdue)
export function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const today = new Date();
  
  // Clear time part for accurate date comparison
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Custom formatter for Recharts tooltip
export function customTooltipFormatter(value: number, name: string): [string, string] {
  const formattedName = name.replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
  
  return [value.toString(), formattedName];
}
