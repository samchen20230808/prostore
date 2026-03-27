import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function formatNumberWithDecimal(num: number): string {
  return num.toFixed(2);
  // const [int, decimal] = num.toString().split(".");
  // return decimal ? `${int}.${decimal.slice(0, 2)}` : `${int}.00`;
}
