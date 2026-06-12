import { useEffect, useRef, useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useMyExports, useRequestExport } from "@/hooks/auth/useExports"
import { exportDownloadHref } from "@/hooks/auth/exports-api"
import { useNotifications } from "@/hooks/notifications/useNotifications"
import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { SectionPanel } from "@/components/profile/section-panel"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { queryKeys } from "@/lib/query-keys"
import { ApiError, triggerAuthLost } from "@/lib/api-client"
import { formatBytes, getErrorMessage } from "@/lib/utils"
import { formatRelativeVerbose } from "@/lib/notifications"

function formatDurationShort(ms: number): string {
    const totalMinutes = Math.max(0, Math.ceil(ms / 60_000))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours === 0) return `${minutes}m`
    return `${hours}h ${minutes}m`
}

export function DataExportSection() {
    const qc = useQueryClient()
    const { data: exports } = useMyExports()
    const { data: notifData } = useNotifications()
    const requestExport = useRequestExport()

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [requestError, setRequestError] = useState<string | null>(null)
    const [nowMs, setNowMs] = useState(() => Date.now())

    // Assumes the API returns exports newest-first. Failed exports do not count toward the
    // 24 hour cooldown, hence the separate latestNonFailed lookup.
    const list = exports ?? []
    const latest = list[0]
    const latestNonFailed = list.find((e) => e.status !== "FAILED")
    const cooldownUntilMs = latestNonFailed
        ? Date.parse(latestNonFailed.requested_at) + 24 * 60 * 60 * 1000
        : 0
    const inCooldown = nowMs < cooldownUntilMs
    const inProgress =
        latest?.status === "PENDING" || latest?.status === "RUNNING"
    const canRequest = !inProgress && !inCooldown

    const isReadyAndFresh =
        latest?.status === "READY"
        && latest.expires_at !== null
        && Date.parse(latest.expires_at) > nowMs

    // Tick once a minute, but only while a countdown is visible, so the cooldown and
    // in-progress labels stay current without rerendering the section forever.
    useEffect(() => {
        if (!inCooldown && !inProgress) return
        const interval = setInterval(() => setNowMs(Date.now()), 60_000)
        return () => clearInterval(interval)
    }, [inCooldown, inProgress])

    // Watch the notifications list for an export-ready or export-failed notification and
    // refetch the exports list when one appears, so the Download button shows up without a
    // manual refresh. The ref dedupes so each notification only triggers one invalidation.
    const lastSeenIdRef = useRef<number | null>(null)
    useEffect(() => {
        const items = notifData?.items ?? []
        for (const n of items) {
            if (
                (n.type === "user_data_export_ready"
                    || n.type === "user_data_export_failed")
                && (lastSeenIdRef.current === null
                    || n.id > lastSeenIdRef.current)
            ) {
                lastSeenIdRef.current = n.id
                qc.invalidateQueries({ queryKey: queryKeys.auth.exports() })
                break
            }
        }
    }, [notifData, qc])

    const onConfirm = async () => {
        setRequestError(null)
        try {
            await requestExport.mutateAsync()
            setConfirmOpen(false)
            toast.success("Export queued. You'll be notified when it's ready.")
        } catch (err) {
            if (err instanceof ApiError && err.isRateLimited) {
                const base = err.message
                // retryAfter comes from the Retry-After header and is in seconds.
                if (err.retryAfter !== null) {
                    setRequestError(
                        `${base} Try again in ${formatDurationShort(err.retryAfter * 1000)}.`,
                    )
                } else {
                    setRequestError(base)
                }
                return
            }
            setRequestError(getErrorMessage(err, "Could not request export."))
        }
    }

    // Deliberately a raw fetch rather than apiFetch: the endpoint streams a zip and apiFetch
    // parses every response as JSON. The auth-lost (401) and stale-export (404) handling that
    // apiFetch would normally provide is replicated inline.
    const onDownload = async (id: string) => {
        try {
            const res = await fetch(exportDownloadHref(id), {
                credentials: "include",
            })
            if (res.status === 401) {
                triggerAuthLost()
                toast.error("Your session expired. Please sign in again.")
                return
            }
            if (res.status === 404) {
                qc.invalidateQueries({ queryKey: queryKeys.auth.exports() })
                toast.error(
                    "This export has expired or is no longer available. Request a new one.",
                )
                return
            }
            if (!res.ok) {
                toast.error(`Download failed (${res.status}).`)
                return
            }
            const blob = await res.blob()
            const cd = res.headers.get("Content-Disposition") ?? ""
            const match = cd.match(/filename="([^"]+)"/)
            const filename = match?.[1] ?? `thps-run-export-${id}.zip`
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch {
            toast.error("Download failed. Please try again.")
        }
    }

    const onOpenChange = (open: boolean) => {
        setConfirmOpen(open)
        if (!open) setRequestError(null)
    }

    let requestDisabledReason: string | null = null
    if (!canRequest) {
        requestDisabledReason = inProgress
            ? "Waiting for the current export to finish!"
            : `Next export available in ${formatDurationShort(cooldownUntilMs - nowMs)}...`
    }

    let statusLine: { text: string; tone: "muted" | "destructive" } | null = null
    if (latest && !isReadyAndFresh) {
        if (inProgress) {
            statusLine = {
                text: "Your export is still being built. You will be notified when it is ready. <3",
                tone: "muted",
            }
        } else if (latest.status === "FAILED") {
            statusLine = { text: "Last export failed.", tone: "destructive" }
        } else {
            statusLine = {
                text: "Previous export expired. Request a new one!",
                tone: "muted",
            }
        }
    }

    return (
        <SectionPanel
            title="Download My Data"
            description={
                <>
                    Request a .zip of your account data that contains ALL of your data from thps.run.
                    We'll build it in the background and notify you when it's ready. You can request
                    one export every 24 hours.
                </>
            }
        >
            <div className="flex flex-col gap-4">
                {statusLine && (
                    <p
                        className={
                            statusLine.tone === "destructive"
                                ? "text-sm text-destructive"
                                : "text-sm text-muted-foreground"
                        }
                    >
                        {statusLine.text}
                    </p>
                )}

                {isReadyAndFresh && latest && (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="default"
                                onClick={() => onDownload(latest.id)}
                            >
                                <Download className="size-4" />
                                Download
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {formatBytes(latest.file_size_bytes ?? 0)}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {latest.completed_at
                                ? `Built ${formatRelativeVerbose(latest.completed_at)}. `
                                : ""}
                            {latest.expires_at
                                ? `Expires ${formatRelativeVerbose(latest.expires_at)}.`
                                : ""}
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <Button
                        variant="default"
                        onClick={() => setConfirmOpen(true)}
                        disabled={!canRequest}
                        className="self-start"
                    >
                        Request Export
                    </Button>
                    {requestDisabledReason && (
                        <p className="text-xs text-muted-foreground">
                            {requestDisabledReason}
                        </p>
                    )}
                </div>
            </div>

            <AlertDialog open={confirmOpen} onOpenChange={onOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Download My Data?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Request a .zip of your account data that contains ALL of your data from thps.run.
                            We'll build it in the background and notify you when it's ready. You can request
                            one export every 24 hours.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {requestError && (
                        <AlertBanner variant="error">
                            {requestError}
                        </AlertBanner>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={requestExport.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onConfirm}
                            disabled={requestExport.isPending}
                        >
                            {requestExport.isPending ? "Requesting..." : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SectionPanel>
    )
}
