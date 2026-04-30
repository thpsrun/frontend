import type { HistoryMode } from "@/types/api"

export const HISTORY_MODES: readonly HistoryMode[] = [
    "overall",
    "monthly",
    "yearly",
] as const

export const MODE_URL_TO_API: Record<HistoryMode, string> = {
    overall: "cumulative",
    monthly: "monthly",
    yearly: "yearly",
}

export const isHistoryMode = (s: string): s is HistoryMode => {
    return (HISTORY_MODES as readonly string[]).includes(s)
}

const MONTH_NAMES: readonly string[] = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

export const monthName = (month: number): string => {
    return MONTH_NAMES[month - 1] ?? ""
}

export const formatPeriod = (
    mode: HistoryMode,
    year: number,
    month: number,
): string => {
    const m = monthName(month)
    if (mode === "overall") {
        return `All time through ${m} ${year}.`
    }
    if (mode === "monthly") {
        return `Points earned in ${m} ${year}.`
    }
    return `Points earned in ${year} (through ${m}).`
}

export const datePickerLabel = (mode: HistoryMode): string => {
    if (mode === "overall") return "As of"
    if (mode === "monthly") return "Month"
    return "Through"
}

export const parseYearMonth = (
    s: string | null | undefined,
): { year: number; month: number } | undefined => {
    if (!s) return undefined
    const m = s.match(/^(\d{4})-(\d{1,2})$/)
    if (!m) return undefined
    const year = Number.parseInt(m[1], 10)
    const month = Number.parseInt(m[2], 10)
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
        return undefined
    }
    if (month < 1 || month > 12) return undefined
    return { year, month }
}
