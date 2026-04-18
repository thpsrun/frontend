import { useEffect, useCallback } from "react"
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
    const blocker = useBlocker(isDirty)

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
            // Save failed — stay on page, error shown by the form
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

    return {
        isBlocked: blocker.state === "blocked",
        handleSave,
        handleDiscard,
        handleCancel,
    }
}
