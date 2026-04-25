const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
]

export function relativeTimeFrom(iso: string): string {
    const then = new Date(iso).getTime()
    const deltaSec = (then - Date.now()) / 1000
    const abs = Math.abs(deltaSec)
    for (const [unit, secs] of UNITS) {
        if (abs >= secs) {
            return rtf.format(Math.round(deltaSec / secs), unit)
        }
    }
    return rtf.format(Math.round(deltaSec), "second")
}
