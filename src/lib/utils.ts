import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value}%`;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });
  if (!res.ok) {
    let msg = `API error: ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) msg = typeof body.error === "string" ? body.error : JSON.stringify(body.error);
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
