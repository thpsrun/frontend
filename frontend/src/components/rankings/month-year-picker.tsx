import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { monthName } from "@/lib/rankings-modes"

export interface YearMonth {
    year: number
    month: number
}

interface MonthYearPickerProps {
    value: YearMonth
    onChange: (value: YearMonth) => void
    min?: YearMonth
    max: YearMonth
}

const DEFAULT_FLOOR_OFFSET = 20

const yearRange = (
    min: YearMonth | undefined,
    max: YearMonth,
): number[] => {
    const minYear = min?.year ?? max.year - DEFAULT_FLOOR_OFFSET
    const out: number[] = []
    for (let y = max.year; y >= minYear; y--) {
        out.push(y)
    }
    return out
}

const validMonthsForYear = (
    year: number,
    min: YearMonth | undefined,
    max: YearMonth,
): number[] => {
    let lo = 1
    let hi = 12
    if (min && year === min.year) lo = Math.max(lo, min.month)
    if (year === max.year) hi = Math.min(hi, max.month)
    if (lo > hi) return []
    const out: number[] = []
    for (let m = lo; m <= hi; m++) out.push(m)
    return out
}

const clampMonth = (month: number, valid: number[]): number => {
    if (valid.length === 0) return month
    if (valid.includes(month)) return month
    let nearest = valid[0]
    for (const m of valid) {
        if (Math.abs(m - month) < Math.abs(nearest - month)) {
            nearest = m
        }
    }
    return nearest
}

export const MonthYearPicker = (
    { value, onChange, min, max }: MonthYearPickerProps,
) => {
    const years = yearRange(min, max)
    const valid = validMonthsForYear(value.year, min, max)

    const onYearChange = (raw: string) => {
        const year = Number.parseInt(raw, 10)
        const newValid = validMonthsForYear(year, min, max)
        const month = clampMonth(value.month, newValid)
        onChange({ year, month })
    }

    const onMonthChange = (raw: string) => {
        const month = Number.parseInt(raw, 10)
        onChange({ year: value.year, month })
    }

    return (
        <div className="flex gap-2 items-center">
            <Select
                value={String(value.month)}
                onValueChange={onMonthChange}
            >
                <SelectTrigger className="w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {valid.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                            {monthName(m)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                value={String(value.year)}
                onValueChange={onYearChange}
            >
                <SelectTrigger className="w-24">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
