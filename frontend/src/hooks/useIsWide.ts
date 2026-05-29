import { useEffect, useState } from "react"

// Tracks whether the viewport matches a min-width media query (default 768px).
// Replaces the hand-rolled matchMedia state duplicated across the run dialogs.
export function useIsWide(minWidthPx = 768): boolean {
    const query = `(min-width: ${minWidthPx}px)`
    const [isWide, setIsWide] = useState(
        typeof window !== "undefined"
            ? window.matchMedia(query).matches
            : true,
    )

    useEffect(() => {
        const mq = window.matchMedia(query)
        const onChange = (e: MediaQueryListEvent) => setIsWide(e.matches)
        mq.addEventListener("change", onChange)
        return () => mq.removeEventListener("change", onChange)
    }, [query])

    return isWide
}
