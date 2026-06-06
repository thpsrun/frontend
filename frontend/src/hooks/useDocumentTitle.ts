import { useEffect } from "react"
import { buildTitle } from "@/lib/page-title"

export const useDocumentTitle = (
    segment?: string | null,
    options?: { enabled?: boolean },
): void => {
    const enabled = options?.enabled ?? true
    useEffect(() => {
        if (!enabled) return
        document.title = buildTitle(segment)
    }, [segment, enabled])
}
