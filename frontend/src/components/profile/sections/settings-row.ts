import { cn } from "@/lib/utils"

export const ROW_CLASS = cn(
    "flex items-center",
    "justify-between",
    "rounded-md",
    "border border-border/40",
    "px-4 py-3",
)

// Allauth reports authenticator created_at as epoch seconds, hence the *1000.
export function formatAddedAt(epochSeconds: number): string {
    return new Date(epochSeconds * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}
