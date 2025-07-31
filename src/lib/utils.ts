import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getDownloadUrl(key: string): Promise<string | null> {
    if (!key) return null;
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.signedUrl;
    } catch (error) {
        console.error("Error getting download URL", error);
        return null;
    }
}
