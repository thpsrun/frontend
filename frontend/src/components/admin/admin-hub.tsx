import { useState } from "react"
import { useSyncLogs } from "@/hooks/admin/useSyncLogs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { Pagination } from "@/components/ui/pagination"
import { QueryErrorBanner } from "@/components/ui/query-error-banner"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import {
    Loader2, RotateCcw, ExternalLink,
} from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import type {
    SyncLogsParams, SyncLogEntry,
} from "@/types/submissions"

const PAGE_SIZE = 50

type SyncStatus = SyncLogEntry["status"]
type SyncAction = SyncLogEntry["action"]
type BadgeVariant = "default" | "secondary" | "destructive"

const STATUS_VARIANT: Record<SyncStatus, BadgeVariant> = {
    pending: "secondary",
    synced: "default",
    failed: "destructive",
}

const ACTION_LABEL: Record<SyncAction, string> = {
    verify: "Verify",
    reject: "Reject",
    change_players: "Change Players",
}

function LogRow({
    entry,
    idx,
    onRetry,
    retrying,
}: {
    entry: SyncLogEntry
    idx: number
    onRetry: (id: number) => void
    retrying: boolean
}) {
    return (
        <TableRow className={cn(
            "transition hover:bg-muted/30",
            idx % 2 === 1 ? "bg-muted/10" : "",
        )}>
            <TableCell>
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm">
                        {entry.run.game_name}
                    </span>
                    <span className={cn(
                        "text-xs text-muted-foreground",
                    )}>
                        {entry.run.category_name}
                        {entry.run.level_name &&
                            ` - ${entry.run.level_name}`}
                    </span>
                </div>
            </TableCell>
            <TableCell className="text-center">
                {ACTION_LABEL[entry.action]}
            </TableCell>
            <TableCell className="text-center">
                <Badge variant={STATUS_VARIANT[entry.status]}>
                    {entry.status}
                </Badge>
            </TableCell>
            <TableCell className="text-center">
                {entry.moderator_name}
            </TableCell>
            <TableCell className="text-center">
                {entry.attempts}/{entry.max_attempts}
            </TableCell>
            <TableCell className="max-w-50">
                {entry.last_error ? (
                    <span
                        className={cn(
                            "text-xs text-destructive",
                            "truncate block",
                        )}
                        title={entry.last_error}
                    >
                        {entry.last_error}
                    </span>
                ) : (
                    <span className={cn(
                        "text-xs text-muted-foreground",
                    )}>
                        -
                    </span>
                )}
            </TableCell>
            <TableCell className={cn(
                "text-xs text-muted-foreground",
                "text-center",
            )}>
                {formatDate(entry.updated_at)}
            </TableCell>
            <TableCell>
                <div className={cn(
                    "flex items-center",
                    "justify-center gap-1",
                )}>
                    {entry.run.url && (
                        <a
                            href={entry.run.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                            >
                                <ExternalLink
                                    className="size-3"
                                />
                            </Button>
                        </a>
                    )}
                    {entry.status === "failed" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            disabled={retrying}
                            onClick={() => onRetry(entry.id)}
                        >
                            {retrying ? (
                                <Loader2 className={cn(
                                    "size-3 animate-spin",
                                )} />
                            ) : (
                                <RotateCcw
                                    className="size-3"
                                />
                            )}
                            Retry
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}

export function AdminHub() {
    const [filters, setFilters] = useState<SyncLogsParams>({
        limit: PAGE_SIZE,
        offset: 0,
    })

    const { data, isLoading, error, refetch, retry } = useSyncLogs(filters)

    const totalPages = data
        ? Math.ceil(data.count / PAGE_SIZE)
        : 0
    const currentPage = Math.floor(
        (filters.offset ?? 0) / PAGE_SIZE,
    ) + 1

    const setFilter = (
        key: keyof SyncLogsParams,
        value: string | undefined,
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            offset: 0,
        }))
    }

    const goToPage = (page: number) => {
        setFilters((prev) => ({
            ...prev,
            offset: (page - 1) * PAGE_SIZE,
        }))
    }

    return (
        <div className="space-y-4">
            <Panel>
                <div>
                    <h2 className="text-xl font-semibold">SRC-thps.run Sync Logs</h2>
                    <p className="text-sm text-muted-foreground">
                        Monitor and Retry Syncs with thps.run
                    </p>
                </div>
            </Panel>

            {error && (
                <QueryErrorBanner error={error} onRetry={refetch} />
            )}

            {isLoading && (
                <Panel className="p-5 w-full">
                    <TableSkeleton
                        columns={8}
                        rows={6}
                        headers={[
                            "Run", "Action", "Status", "Moderator",
                            "Attempts", "Last Error", "Updated", "Actions",
                        ]}
                    />
                </Panel>
            )}

            {data && (
                <Panel className="p-5 w-full">
                    <div className={cn(
                        "flex flex-wrap gap-3 mb-4",
                    )}>
                        <Select
                            value={filters.status ?? "all"}
                            onValueChange={(v) =>
                                setFilter(
                                    "status",
                                    v === "all"
                                        ? undefined : v,
                                )
                            }
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue
                                    placeholder="Status"
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Statuses
                                </SelectItem>
                                <SelectItem value="pending">
                                    Pending
                                </SelectItem>
                                <SelectItem value="synced">
                                    Synced
                                </SelectItem>
                                <SelectItem value="failed">
                                    Failed
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.action ?? "all"}
                            onValueChange={(v) =>
                                setFilter(
                                    "action",
                                    v === "all"
                                        ? undefined : v,
                                )
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue
                                    placeholder="Action"
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Actions
                                </SelectItem>
                                <SelectItem value="verify">
                                    Verify
                                </SelectItem>
                                <SelectItem value="reject">
                                    Reject
                                </SelectItem>
                                <SelectItem
                                    value="change_players"
                                >
                                    Change Players
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className={cn(
                        "rounded-md border",
                        "border-border/40 overflow-hidden",
                    )}>
                        <Table>
                            <TableHeader>
                                <TableRow
                                    className="bg-muted/20"
                                >
                                    <TableHead
                                        className="text-center"
                                    >
                                        Run
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Action
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Status
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Moderator
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Attempts
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Last Error
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Updated
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.results.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className={cn(
                                                "text-center",
                                                "py-8",
                                                "text-muted-foreground",
                                            )}
                                        >
                                            No sync logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.results.map(
                                        (entry, idx) => (
                                            <LogRow
                                                key={entry.id}
                                                entry={entry}
                                                idx={idx}
                                                onRetry={(
                                                    id,
                                                ) =>
                                                    retry.mutate(
                                                        id,
                                                    )
                                                }
                                                retrying={
                                                    retry.isPending &&
                                                    retry.variables ===
                                                        entry.id
                                                }
                                            />
                                        ),
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        totalLabel={`${data.count} total logs`}
                    />
                </Panel>
            )}
        </div>
    )
}
