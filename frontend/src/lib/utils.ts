import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback
}

export function formatDate(
    iso: string | null | undefined,
    fallback: string = "-",
): string {
    if (!iso) return fallback
    return new Date(iso).toLocaleString()
}

export function truncate(
    text: string | null | undefined,
    max: number,
): string {
    if (!text) return ""
    return text.length > max ? `${text.slice(0, max)}…` : text
}

export function buildQueryString<T extends object>(params: T): string {
    const sp = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue
        sp.set(key, String(value))
    }
    const qs = sp.toString()
    return qs ? `?${qs}` : ""
}
