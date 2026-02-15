import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP').format(amount) + '円'
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ja-JP')
}
