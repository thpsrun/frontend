import { useState } from "react"
import { Link } from "react-router"
import {
    Plus, RotateCcw, ExternalLink, Database,
} from "lucide-react"
import { useReconcileJobs } from "@/hooks/admin/useReconcile"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/common/query-error-banner"
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
import { JobStatusBadge } from "./job-status-badge"
import { StartReconcileDialog } from "./start-reconcile-dialog"
import { describeTarget } from "./format-target"
import { cn, formatDate } from "@/lib/utils"
import {
    SCOPE_LABEL,
    STATUS_LABEL,
    type ReconcileJob,
    type ReconcileJobsParams,
    type ReconcileScope,
    type ReconcileStatus,
} from "@/types/reconcile"

const PAGE_SIZE = 25

const STATUS_FILTER_OPTIONS: ReconcileStatus[] = [
    "PENDING",
    "IN_PROGRESS",
    "SUCCEEDED",
    "FAILED",
    "CANCELLED",
]

const SCOPE_FILTER_OPTIONS: ReconcileScope[] = ["GAME", "LEADERBOARD", "RUN", "SERIES"]

// A null end means the job is still running, so measure against now; the list's 15 second
// poll keeps the value ticking without per-row timers.
function formatDuration(start: string | null, end: string | null): string {
    if (!start) return "-"
    const startMs = Date.parse(start)
    const endMs = end ? Date.parse(end) : Date.now()
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) return "-"
    const seconds = Math.max(0, Math.round((endMs - startMs) / 1000))
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const rem = seconds % 60
    if (minutes < 60) return `${minutes}m ${rem}s`
    const hours = Math.floor(minutes / 60)
    const mrem = minutes % 60
    return `${hours}h ${mrem}m`
}

function shortId(id: string): string {
    return id.split("-")[0]
}

// Glyph prefixes keep the column narrow: + created, ~ updated, = skipped, ! failed.
// Hover titles spell them out.
function CountsCell({ job }: { job: ReconcileJob }) {
    const c = job.counts
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span title="Created">
                <span className="text-muted-foreground">+</span>{c.created ?? 0}
            </span>
            <span title="Updated">
                <span className="text-muted-foreground">~</span>{c.updated ?? 0}
            </span>
            <span title="Skipped" className="text-muted-foreground">
                ={c.skipped ?? 0}
            </span>
            <span
                title="Failed"
                className={cn(
                    (c.failed ?? 0) > 0 ? "text-destructive" : "text-muted-foreground",
                )}
            >
                !{c.failed ?? 0}
            </span>
        </div>
    )
}

function JobRow({ job, idx }: { job: ReconcileJob; idx: number }) {
    return (
        <TableRow className={cn(
            "transition hover:bg-muted/30",
            idx % 2 === 1 ? "bg-muted/10" : "",
        )}>
            <TableCell className="font-mono text-xs">
                {shortId(job.id)}
            </TableCell>
            <TableCell className="text-center text-xs">
                {SCOPE_LABEL[job.scope]}
            </TableCell>
            <TableCell className="text-xs">
                {describeTarget(job)}
            </TableCell>
            <TableCell className="text-center text-xs">
                {job.source_of_truth === "SRC" ? "SRC" : "thps.run"}
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <JobStatusBadge status={job.status} />
                </div>
            </TableCell>
            <TableCell>
                <CountsCell job={job} />
            </TableCell>
            <TableCell className="text-center text-xs text-muted-foreground">
                {job.requested_by ?? "-"}
            </TableCell>
            <TableCell className="text-center text-xs text-muted-foreground">
                {formatDate(job.created_at)}
            </TableCell>
            <TableCell className="text-center text-xs text-muted-foreground">
                {formatDuration(job.started_at, job.finished_at)}
            </TableCell>
            <TableCell className="text-center">
                <Link to={`/admin/reconcile/${job.id}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                        <ExternalLink className="size-3" />
                        View
                    </Button>
                </Link>
            </TableCell>
        </TableRow>
    )
}

export function ReconcilePage() {
    const [filters, setFilters] = useState<ReconcileJobsParams>({
        limit: PAGE_SIZE,
        offset: 0,
    })
    const [dialogOpen, setDialogOpen] = useState(false)

    // The hook polls every 15 seconds, so running jobs advance without the manual Refresh.
    const { data, isLoading, error, refetch } = useReconcileJobs(filters)

    const limit = filters.limit ?? PAGE_SIZE
    const total = data?.total ?? 0
    const totalPages = total ? Math.ceil(total / limit) : 0
    const currentPage = Math.floor((filters.offset ?? 0) / limit) + 1

    const setStatus = (value: string) => {
        setFilters((prev) => ({
            ...prev,
            status: value === "all" ? undefined : (value as ReconcileStatus),
            offset: 0,
        }))
    }

    const setScope = (value: string) => {
        setFilters((prev) => ({
            ...prev,
            scope: value === "all" ? undefined : (value as ReconcileScope),
            offset: 0,
        }))
    }

    const goToPage = (page: number) => {
        setFilters((prev) => ({
            ...prev,
            offset: (page - 1) * limit,
        }))
    }

    return (
        <div className="space-y-4">
            <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">Reconciliation</h2>
                        <p className="text-sm text-muted-foreground">
                            Queue and monitor reconciliation jobs between thps.run and Speedrun.com.
                        </p>
                    </div>
                    <Button
                        onClick={() => setDialogOpen(true)}
                        className="gap-1"
                    >
                        <Plus className="size-4" />
                        Start Reconciliation
                    </Button>
                </div>
            </Panel>

            {error && (
                <QueryErrorBanner error={error} onRetry={refetch} />
            )}

            <Panel className="p-5">
                <div className="flex flex-wrap items-end gap-3 mb-4">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Status</span>
                        <Select
                            value={filters.status ?? "all"}
                            onValueChange={setStatus}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {STATUS_FILTER_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {STATUS_LABEL[opt]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Scope</span>
                        <Select
                            value={filters.scope ?? "all"}
                            onValueChange={setScope}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Scopes</SelectItem>
                                {SCOPE_FILTER_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {SCOPE_LABEL[opt]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <TextFilterField
                        label="Target ID"
                        placeholder="thps3"
                        isApplied={Boolean(filters.target_id)}
                        onApply={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                target_id: value || undefined,
                                offset: 0,
                            }))
                        }
                        onClear={() =>
                            setFilters((prev) => ({
                                ...prev,
                                target_id: undefined,
                                offset: 0,
                            }))
                        }
                    />

                    <div className="ml-auto">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => refetch()}
                            className="gap-1"
                        >
                            <RotateCcw className="size-3" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton
                        columns={10}
                        rows={6}
                        headers={[
                            "Job", "Scope", "Target", "Source",
                            "Status", "Counts", "By", "Created",
                            "Duration", "",
                        ]}
                    />
                ) : (
                    <div className="rounded-md border border-border/40 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20">
                                    <TableHead>Job</TableHead>
                                    <TableHead className="text-center">Scope</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead className="text-center">Source</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Counts</TableHead>
                                    <TableHead className="text-center">By</TableHead>
                                    <TableHead className="text-center">Created</TableHead>
                                    <TableHead className="text-center">Duration</TableHead>
                                    <TableHead className="text-center"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data && data.items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="p-0">
                                            <EmptyState
                                                inset
                                                icon={Database}
                                                title="No reconciliation jobs."
                                                description="Start one with the button above."
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.items.map((job, idx) => (
                                        <JobRow key={job.id} job={job} idx={idx} />
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
                    totalLabel={`${total} total jobs`}
                />
            </Panel>

            <StartReconcileDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    )
}
