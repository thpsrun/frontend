import { useCallback, useRef, useState } from "react"
import { ApiError } from "@/lib/api-client"

export function useReauthGuard() {
    const [reauthNeeded, setReauthNeeded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const pending = useRef<
        { action: () => Promise<void>; fallback: string } | null
    >(null)

    const runGuarded = useCallback(
        async (action: () => Promise<void>, fallback: string) => {
            setError(null)
            try {
                await action()
                pending.current = null
            } catch (err) {
                if (err instanceof ApiError && err.status === 401) {
                    pending.current = { action, fallback }
                    setReauthNeeded(true)
                    return
                }
                setError(err instanceof ApiError ? err.message : fallback)
            }
        },
        [],
    )

    const onReauthed = useCallback(() => {
        setReauthNeeded(false)
        const p = pending.current
        if (p) void runGuarded(p.action, p.fallback)
    }, [runGuarded])

    const reset = useCallback(() => {
        setReauthNeeded(false)
        setError(null)
        pending.current = null
    }, [])

    return { reauthNeeded, error, runGuarded, onReauthed, reset }
}
