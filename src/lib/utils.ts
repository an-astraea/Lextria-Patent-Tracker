
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateForDatabase(dateString: string | null): string | null {
  if (!dateString) return null;
  
  // If the date is already in ISO format, return it
  if (dateString.includes('T')) {
    return dateString;
  }
  
  // Convert YYYY-MM-DD to ISO format
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}
