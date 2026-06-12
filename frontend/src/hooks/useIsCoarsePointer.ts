import { useEffect, useState } from "react"

export function useIsCoarsePointer(): boolean {
    const query = "(pointer: coarse)"
    const [coarse, setCoarse] = useState(
        typeof window !== "undefined"
            ? window.matchMedia(query).matches
            : false,
    )

    useEffect(() => {
        const mq = window.matchMedia(query)
        const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches)
        mq.addEventListener("change", onChange)
        return () => mq.removeEventListener("change", onChange)
    }, [])

    return coarse
}
