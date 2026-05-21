import { useEffect, useCallback, useRef } from "react"
import { useBlocker } from "react-router"

interface UseUnsavedChangesGuardOptions {
    isDirty: boolean
    onSave: () => Promise<void>
    onDiscard: () => void
}

export function useUnsavedChangesGuard({
    isDirty,
    onSave,
    onDiscard,
}: UseUnsavedChangesGuardOptions) {
    const skipNextRef = useRef(false)

    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        if (skipNextRef.current) {
            skipNextRef.current = false
            return false
        }
        return isDirty && currentLocation.pathname !== nextLocation.pathname
    })

    useEffect(() => {
        if (!isDirty) return

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault()
        }
        window.addEventListener("beforeunload", handler)
        return () => window.removeEventListener("beforeunload", handler)
    }, [isDirty])

    const handleSave = useCallback(async () => {
        try {
            await onSave()
            if (blocker.state === "blocked") {
                blocker.proceed()
            }
        } catch {
            //
        }
    }, [onSave, blocker])

    const handleDiscard = useCallback(() => {
        onDiscard()
        if (blocker.state === "blocked") {
            blocker.proceed()
        }
    }, [onDiscard, blocker])

    const handleCancel = useCallback(() => {
        if (blocker.state === "blocked") {
            blocker.reset()
        }
    }, [blocker])

    const bypassNext = useCallback(() => {
        skipNextRef.current = true
    }, [])

    return {
        isBlocked: blocker.state === "blocked",
        handleSave,
        handleDiscard,
        handleCancel,
        bypassNext,
    }
}
