import { Input } from "@/components/ui/input"

export interface TimeFields {
    hrs: string
    min: string
    sec: string
    ms: string
}

export const EMPTY_TIME: TimeFields = { hrs: "", min: "", sec: "", ms: "" }

export function assembleTime(fields: TimeFields): string | null {
    const h = parseInt(fields.hrs) || 0
    const m = parseInt(fields.min) || 0
    const s = parseInt(fields.sec) || 0
    const ms = parseInt(fields.ms) || 0
    if (h === 0 && m === 0 && s === 0 && ms === 0) return null
    return `${h}h ${m}m ${s}s ${ms}ms`
}

// Splits a numeric time_secs (e.g. 754.567) into the discrete TimeFields
// used by TimeRow, so the edit dialog can seed the form from the API value.
export function parseTimeSecs(secs: number | null): TimeFields {
    if (secs === null || secs <= 0) return { ...EMPTY_TIME }
    const totalMs = Math.round(secs * 1000)
    const hrs = Math.floor(totalMs / 3_600_000)
    const min = Math.floor((totalMs % 3_600_000) / 60_000)
    const sec = Math.floor((totalMs % 60_000) / 1000)
    const ms = totalMs % 1000
    return {
        hrs: hrs > 0 ? String(hrs) : "",
        min: min > 0 || hrs > 0 ? String(min) : "",
        sec: String(sec),
        ms: ms > 0 ? String(ms) : "",
    }
}

// Quick check to make sure it is a valid YouTube URL, since we don't allow anything else.
export function isValidYouTubeUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        const validHosts = [
            "youtube.com", "www.youtube.com",
            "m.youtube.com", "youtu.be",
        ]
        return validHosts.includes(parsed.hostname)
    } catch {
        return false
    }
}

// Extracts a YouTube video ID from any accepted URL form and returns a
// privacy-enabled embed URL.
export function getYouTubeEmbedUrl(url: string): string | null {
    if (!isValidYouTubeUrl(url)) return null
    try {
        const parsed = new URL(url)
        let id: string | null = null
        if (parsed.hostname === "youtu.be") {
            id = parsed.pathname.slice(1).split("/")[0] || null
        } else {
            id = parsed.searchParams.get("v")
            if (!id) {
                const parts = parsed.pathname.split("/").filter(Boolean)
                if (
                    parts.length >= 2
                    && ["embed", "shorts", "v"].includes(parts[0])
                ) {
                    id = parts[1] || null
                }
            }
        }
        if (!id || !/^[A-Za-z0-9_-]{6,32}$/.test(id)) return null
        return `https://www.youtube-nocookie.com/embed/${id}`
    } catch {
        return null
    }
}

export function getTodayString(): string {
    return new Date().toISOString().slice(0, 10)
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {children}
        </p>
    )
}

export function Divider() {
    return <div className="border-t border-border/40" />
}

export function ReadOnlyField({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="bg-muted/20 border border-border/40 rounded-md px-3 py-2 text-sm">
                {value}
            </div>
        </div>
    )
}

export function TimeRow({
    label,
    fields,
    onChange,
}: {
    label: string
    fields: TimeFields
    onChange: (fields: TimeFields) => void
}) {
    const inputs: { key: keyof TimeFields; unit: string }[] = [
        { key: "hrs", unit: "hrs" },
        { key: "min", unit: "min" },
        { key: "sec", unit: "sec" },
        { key: "ms", unit: "ms" },
    ]

    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="flex gap-2">
                {inputs.map(({ key, unit }) => (
                    <div key={key} className="flex flex-col items-center gap-0.5">
                        <Input
                            className="w-20 text-center font-mono"
                            type="number"
                            min={0}
                            placeholder="0"
                            value={fields[key]}
                            onChange={(e) =>
                                onChange({ ...fields, [key]: e.target.value })
                            }
                        />
                        <span className="text-[10px] text-muted-foreground">
                            {unit}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
