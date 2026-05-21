import { useState } from "react"
import { Link, useParams } from "react-router"
import {
    ArrowLeft, RotateCcw, Ban,
    AlertTriangle, ClipboardList,
} from "lucide-react"
import {
    useReconcileJob,
    useReconcileItems,
    useCancelReconcile,
    isJobActive,
} from "@/hooks/admin/useReconcile"
import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { MetaRow } from "@/components/common/meta-row"
import { Pagination } from "@/components/ui/pagination"
import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/common/query-error-banner"
import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/common/table-skeleton"
import { TextFilterField } from "@/components/common/text-filter-field"
import { EmptyState } from "@/components/common/empty-state"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
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
import { JobStatusBadge } from "./job-status-badge"
import { describeTarget } from "./format-target"
import { cn, formatDate } from "@/lib/utils"
import {
    SCOPE_LABEL,
    type ReconcileChangeValue,
    type ReconcileItemDetail,
    type ReconcileItemsParams,
} from "@/types/reconcile"

const PAGE_SIZE = 50

const ACTION_FILTERS: { value: "all" | string; label: string }[] = [
    { value: "all", label: "All Actions" },
    { value: "created", label: "Created" },
    { value: "updated", label: "Updated" },
    { value: "skipped", label: "Skipped" },
    { value: "skipped_no_change", label: "Skipped (No Change)" },
    { value: "failed", label: "Failed" },
]

function isDiffShape(
    value: ReconcileChangeValue,
): value is { old?: unknown; new?: unknown } {
    return (
        value !== null
        && typeof value === "object"
        && ("old" in value || "new" in value)
    )
}

function formatChangeEntry(key: string, value: ReconcileChangeValue): string {
    if (isDiffShape(value)) {
        const oldV = JSON.stringify(value.old ?? null)
        const newV = JSON.stringify(value.new ?? null)
        return `${key}: ${oldV} -> ${newV}`
    }
    return `${key}: ${JSON.stringify(value)}`
}

function CountTile({
    label,
    value,
    tone,
}: {
    label: string
    value: number
    tone: "neutral" | "good" | "warn" | "bad"
}) {
    const toneClass = {
        neutral: "text-foreground",
        good: "text-emerald-400",
        warn: "text-amber-400",
        bad: value > 0 ? "text-destructive" : "text-muted-foreground",
    }[tone]

    return (
        <div className={cn(
            "rounded-md border border-border/40 bg-muted/10 px-4 py-3",
            "flex flex-col items-center justify-center gap-1",
        )}>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {label}
            </span>
            <span className={cn("text-2xl font-semibold", toneClass)}>
                {value}
            </span>
        </div>
    )
}

function ChangesSummary({
    changes,
}: {
    changes?: Record<string, ReconcileChangeValue>
}) {
    if (!changes || Object.keys(changes).length === 0) {
        return <span className="text-muted-foreground">-</span>
    }
    const fields = Object.keys(changes)
    const summary = fields.slice(0, 3).join(", ")
    const more = fields.length > 3 ? ` +${fields.length - 3}` : ""
    const tooltip = fields
        .map((f) => formatChangeEntry(f, changes[f] ?? null))
        .join("\n")
    return (
        <span
            className="text-xs font-mono text-muted-foreground"
            title={tooltip}
        >
            {summary}{more}
        </span>
    )
}

function ItemRow({
    item,
    idx,
}: {
    item: ReconcileItemDetail
    idx: number
}) {
    return (
        <TableRow className={cn(
            "transition hover:bg-muted/30",
            idx % 2 === 1 ? "bg-muted/10" : "",
        )}>
            <TableCell className="text-xs">
                <span className="font-mono">{item.action}</span>
            </TableCell>
            <TableCell className="text-xs font-mono">
                {item.record_type}
            </TableCell>
            <TableCell className="text-xs font-mono break-all">
                {item.record_id}
            </TableCell>
            <TableCell>
                <ChangesSummary changes={item.changes} />
            </TableCell>
            <TableCell className="text-xs">
                {item.error ? (
                    <span
                        className="text-destructive truncate block max-w-48"
                        title={item.error}
                    >
                        {item.error}
                    </span>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground text-right whitespace-nowrap">
                {formatDate(item.created_at)}
            </TableCell>
        </TableRow>
    )
}

function JobMetaSkeleton() {
    return (
        <Panel className="p-5">
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex justify-between items-center py-2",
                            "border-b border-border/30 last:border-b-0",
                        )}
                    >
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ))}
            </div>
        </Panel>
    )
}

export function ReconcileDetailPage() {
    const { jobId } = useParams<{ jobId: string }>()

    const jobQuery = useReconcileJob(jobId)
    const job = jobQuery.data

    const [itemsFilters, setItemsFilters] = useState<ReconcileItemsParams>({
        limit: PAGE_SIZE,
        offset: 0,
    })

    const [defaultedForJobId, setDefaultedForJobId] = useState<string | null>(null)
    if (job && jobId && defaultedForJobId !== jobId) {
        setDefaultedForJobId(jobId)
        if (job.scope === "SERIES" && itemsFilters.record_type === undefined) {
            setItemsFilters((prev) => ({
                ...prev,
                record_type: "series_game",
                offset: 0,
            }))
        }
    }

    const itemsQuery = useReconcileItems(jobId, itemsFilters)
    const items = itemsQuery.data

    const cancel = useCancelReconcile()
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)

    const limit = itemsFilters.limit ?? PAGE_SIZE
    const totalPages = items?.total
        ? Math.ceil(items.total / limit)
        : 0
    const currentPage = Math.floor((itemsFilters.offset ?? 0) / limit) + 1

    const showCancel = Boolean(job && isJobActive(job.status))

    const setActionFilter = (value: string) => {
        setItemsFilters((prev) => ({
            ...prev,
            action: value === "all" ? undefined : value,
            offset: 0,
        }))
    }

    const goToPage = (page: number) => {
        setItemsFilters((prev) => ({
            ...prev,
            offset: (page - 1) * limit,
        }))
    }

    const handleConfirmCancel = async () => {
        if (!jobId) return
        try {
            await cancel.mutateAsync(jobId)
        } finally {
            setConfirmCancelOpen(false)
        }
    }

    return (
        <div className="space-y-4">
            <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/reconcile">
                            <Button size="sm" variant="ghost" className="gap-1">
                                <ArrowLeft className="size-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold">
                                Reconciliation Job
                            </h2>
                            <p
                                className="text-xs text-muted-foreground font-mono"
                                title={jobId}
                            >
                                {jobId}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {job && <JobStatusBadge status={job.status} />}
                        {job?.phase && (
                            <span
                                className={cn(
                                    "text-[10px] font-mono uppercase tracking-wider",
                                    "border border-border/50 bg-muted/30 text-muted-foreground",
                                    "px-1.5 py-0.5 rounded",
                                )}
                                title="Reconciliation phase"
                            >
                                {job.phase}
                            </span>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => jobQuery.refetch()}
                            className="gap-1"
                        >
                            <RotateCcw className="size-3" />
                            Refresh
                        </Button>
                        {showCancel && (
                            <Button
                                size="sm"
                                variant="destructive"
                                disabled={cancel.isPending}
                                onClick={() => setConfirmCancelOpen(true)}
                                className="gap-1"
                            >
                                <Ban className="size-3" />
                                {cancel.isPending ? "Cancelling..." : "Cancel"}
                            </Button>
                        )}
                    </div>
                </div>
            </Panel>

            {jobQuery.error && (
                <QueryErrorBanner
                    error={jobQuery.error}
                    onRetry={jobQuery.refetch}
                />
            )}

            {job && job.status === "FAILED" && job.error_summary && (
                <AlertBanner variant="error">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Job failed</p>
                            <p className="text-sm whitespace-pre-wrap">
                                {job.error_summary}
                            </p>
                        </div>
                    </div>
                </AlertBanner>
            )}

            {jobQuery.isLoading && !job ? (
                <div className="grid gap-4 md:grid-cols-2">
                    <JobMetaSkeleton />
                    <JobMetaSkeleton />
                </div>
            ) : job ? (
                <div className="grid gap-4 md:grid-cols-2">
                    <Panel className="p-5">
                        <h3 className="text-base font-semibold mb-3">Overview</h3>
                        <div className="space-y-0">
                            <MetaRow label="Scope">{SCOPE_LABEL[job.scope]}</MetaRow>
                            <MetaRow label="Target">
                                <span className="font-mono text-xs">
                                    {describeTarget(job)}
                                </span>
                            </MetaRow>
                            <MetaRow label="Source of Truth">
                                {job.source_of_truth === "SRC" ? "Speedrun.com" : "thps.run"}
                            </MetaRow>
                            <MetaRow label="Requested By">
                                {job.requested_by ?? "-"}
                            </MetaRow>
                            <MetaRow label="Created">
                                {formatDate(job.created_at)}
                            </MetaRow>
                            <MetaRow label="Started">
                                {formatDate(job.started_at)}
                            </MetaRow>
                            <MetaRow label="Finished">
                                {formatDate(job.finished_at)}
                            </MetaRow>
                            <MetaRow label="Celery Task">
                                <span className="font-mono text-xs break-all">
                                    {job.celery_task_id || "-"}
                                </span>
                            </MetaRow>
                        </div>
                    </Panel>

                    <Panel className="p-5">
                        <h3 className="text-base font-semibold mb-3">Counts</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <CountTile
                                label="Created"
                                value={job.counts.created ?? 0}
                                tone="good"
                            />
                            <CountTile
                                label="Updated"
                                value={job.counts.updated ?? 0}
                                tone="neutral"
                            />
                            <CountTile
                                label="Skipped"
                                value={job.counts.skipped ?? 0}
                                tone="warn"
                            />
                            <CountTile
                                label="Failed"
                                value={job.counts.failed ?? 0}
                                tone="bad"
                            />
                        </div>
                    </Panel>
                </div>
            ) : null}

            {job?.scope === "SERIES" && job.breakdown && (
                <Panel className="p-5">
                    <h3 className="text-base font-semibold mb-3">
                        Sweep Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <CountTile
                            label="Imported (new games)"
                            value={job.breakdown.series_game?.created ?? 0}
                            tone="good"
                        />
                        <CountTile
                            label="Skipped (already in DB)"
                            value={job.breakdown.series_game?.skipped ?? 0}
                            tone="warn"
                        />
                        <CountTile
                            label="Failed (per-game)"
                            value={job.breakdown.series_game?.failed ?? 0}
                            tone="bad"
                        />
                        <CountTile
                            label="Series refreshed"
                            value={
                                (job.breakdown.series?.created ?? 0)
                                + (job.breakdown.series?.updated ?? 0)
                            }
                            tone="neutral"
                        />
                        <CountTile
                            label="Series fetch failures"
                            value={job.breakdown.series?.failed ?? 0}
                            tone="bad"
                        />
                    </div>
                </Panel>
            )}

            {job?.breakdown && Object.keys(job.breakdown).length > 0 && (
                <Panel className="p-5">
                    <h3 className="text-base font-semibold mb-3">
                        Breakdown by Record Type
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(job.breakdown).map(([recordType, counts]) => (
                            <div key={recordType} className="space-y-2">
                                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                                    {recordType}
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <CountTile
                                        label="Created"
                                        value={counts.created ?? 0}
                                        tone="good"
                                    />
                                    <CountTile
                                        label="Updated"
                                        value={counts.updated ?? 0}
                                        tone="neutral"
                                    />
                                    <CountTile
                                        label="Skipped"
                                        value={counts.skipped ?? 0}
                                        tone="warn"
                                    />
                                    <CountTile
                                        label="Failed"
                                        value={counts.failed ?? 0}
                                        tone="bad"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}

            <Panel className="p-5">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-base font-semibold">Items</h3>
                        <p className="text-xs text-muted-foreground">
                            Per-record results from this reconciliation.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Action</span>
                            <Select
                                value={itemsFilters.action ?? "all"}
                                onValueChange={setActionFilter}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTION_FILTERS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <TextFilterField
                            label="Record Type"
                            placeholder="run, player, ..."
                            isApplied={Boolean(itemsFilters.record_type)}
                            onApply={(value) =>
                                setItemsFilters((prev) => ({
                                    ...prev,
                                    record_type: value || undefined,
                                    offset: 0,
                                }))
                            }
                            onClear={() =>
                                setItemsFilters((prev) => ({
                                    ...prev,
                                    record_type: undefined,
                                    offset: 0,
                                }))
                            }
                        />
                    </div>
                </div>

                {itemsQuery.isLoading ? (
                    <TableSkeleton
                        columns={6}
                        rows={6}
                        headers={[
                            "Action", "Record Type", "Record ID",
                            "Changes", "Error", "When",
                        ]}
                    />
                ) : (
                    <div className="rounded-md border border-border/40 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20">
                                    <TableHead>Action</TableHead>
                                    <TableHead>Record Type</TableHead>
                                    <TableHead>Record ID</TableHead>
                                    <TableHead>Changes</TableHead>
                                    <TableHead>Error</TableHead>
                                    <TableHead className="text-right">When</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items && items.items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="p-0">
                                            <EmptyState
                                                inset
                                                icon={ClipboardList}
                                                title="No items recorded yet."
                                                description={
                                                    job && isJobActive(job.status)
                                                        ? "Items will appear as the job runs."
                                                        : "This job processed nothing matching the filters."
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items?.items.map((item, idx) => (
                                        <ItemRow key={item.id} item={item} idx={idx} />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    totalLabel={`${items?.total ?? 0} total items`}
                />
            </Panel>

            <AlertDialog
                open={confirmCancelOpen}
                onOpenChange={(open) => {
                    if (!cancel.isPending) setConfirmCancelOpen(open)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this job?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The reconciliation will stop as soon as the Celery worker checks in. Items already processed remain.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={cancel.isPending}>
                            Keep Running
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={cancel.isPending}
                            onClick={(e) => {
                                e.preventDefault()
                                handleConfirmCancel()
                            }}
                        >
                            {cancel.isPending ? "Cancelling..." : "Cancel Job"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
