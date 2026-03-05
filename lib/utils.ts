import { customAlphabet } from "nanoid";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

/**
 * Get the base URL for the current environment.
 * Works for local dev, Vercel preview deployments, and production.
 */
export function getURL() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Production site URL
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Vercel preview deployments
    'http://localhost:3000'

  // Vercel URLs don't include protocol
  url = url.startsWith('http') ? url : `https://${url}`
  // Ensure trailing slash
  url = url.endsWith('/') ? url : `${url}/`

  return url
}