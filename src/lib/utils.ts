import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function generateAccountNumber(): string {
  return Math.random().toString().slice(2, 12).padStart(10, "0")
}

export function generateRoutingNumber(): string {
  return "021000021" // Example routing number for demo purposes
}
