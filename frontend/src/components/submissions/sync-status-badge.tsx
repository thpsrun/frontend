import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Loader2 } from "lucide-react"
import type { SrcSyncEntry } from "@/types/submissions"

// Surfaces a run's speedrun.com (SRC) sync state. Failed takes precedence over pending,
// and fully synced runs render no badge at all.
export function SyncStatusBadge({
    sync,
}: {
    sync: SrcSyncEntry[]
}) {
    if (sync.length === 0) return null

    const failed = sync.find((s) => s.status === "failed")
    if (failed) {
        return (
            <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="size-3" />
                Sync failed ({failed.attempts} attempts)
            </Badge>
        )
    }

    const pending = sync.find((s) => s.status === "pending")
    if (pending) {
        return (
            <Badge variant="secondary" className="gap-1">
                <Loader2 className="size-3 animate-spin" />
                Syncing to SRC
            </Badge>
        )
    }

    return null
}
