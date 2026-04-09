import { useState } from "react"
import { Navigate } from "react-router"
import { useAuth } from "@/hooks/auth/useAuth"
import { useSyncLogs } from "@/hooks/admin/useSyncLogs"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Loader2, RotateCcw, ExternalLink, ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
    SyncLogsParams, SyncLogEntry,
} from "@/types/submissions"

const PAGE_SIZE = 50

const statusVariant: Record<
    string, "default" | "secondary" | "destructive"
> = {
    pending: "secondary",
    synced: "default",
    failed: "destructive",
}

// The API returns an ISO-compliant string, but this is to help
// normalize it and have it appear as a date.
function formatDate(iso: string): string {
    return new Date(iso).toLocaleString()
}

function actionLabel(action: string): string {
    switch (action) {
        case "verify": return "Verify"
        case "reject": return "Reject"
        case "change_players": return "Change Players"
        default: return action
    }
}

// This function is to setup how the table is formatted within the
// admin hub. The admin hub is supposed to be a collection of the
// CURRENT speedruns waiting to be synced with SRC, their status,
// and any issues they have come across. There will be more specifics
// (e.g. the JSON output) on the Django admin portal, but this should
// capture a lot of the major issues (unless SRC is super broken).
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
                {actionLabel(entry.action)}
            </TableCell>
            <TableCell className="text-center">
                <Badge variant={
                    statusVariant[entry.status]
                        ?? "secondary"
                }>
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
    const { player, isLoading: authLoading } = useAuth()
    const [filters, setFilters] = useState<SyncLogsParams>({
        limit: PAGE_SIZE,
        offset: 0,
    })

    const { data, isLoading, error, retry } = useSyncLogs(
        filters,
        { enabled: !!player?.is_superuser },
    )

    // If the user is not a superuser within the Django admin panel,
    // then they are sent back to the main page.
    if (!authLoading && !player?.is_superuser) {
        return <Navigate to="/" replace />
    }

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
        <div className={cn(
            "mx-auto w-full max-w-6xl px-4 py-8",
            "space-y-6",
        )}>
            {error && (
                <AlertBanner variant="error">
                    {error.message}
                </AlertBanner>
            )}

            {isLoading && (
                <div className={cn(
                    "flex items-center gap-2",
                    "text-muted-foreground py-8",
                )}>
                    <Loader2 className="size-4 animate-spin" />
                    Loading SRC-thps.run sync logs...
                </div>
            )}

            {data && (
                <div className={cn(
                    "rounded-lg border border-border/40",
                    "bg-background/70 backdrop-blur-sm",
                    "shadow-sm p-5 w-full",
                )}>
                    <h2 className={cn(
                        "text-xl font-semibold mb-4",
                    )}>
                        SRC-thps.run Sync Logs
                    </h2>

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

                    {totalPages > 1 && (
                        <div className={cn(
                            "flex items-center",
                            "justify-between pt-4",
                            "text-sm",
                        )}>
                            <span className={cn(
                                "text-muted-foreground",
                            )}>
                                {data.count} total logs
                            </span>
                            <div className={cn(
                                "flex items-center gap-2",
                            )}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        currentPage <= 1
                                    }
                                    onClick={() =>
                                        goToPage(
                                            currentPage - 1,
                                        )
                                    }
                                >
                                    <ChevronLeft
                                        className="size-4"
                                    />
                                </Button>
                                <span>
                                    Page {currentPage} of{" "}
                                    {totalPages}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        currentPage >=
                                            totalPages
                                    }
                                    onClick={() =>
                                        goToPage(
                                            currentPage + 1,
                                        )
                                    }
                                >
                                    <ChevronRight
                                        className="size-4"
                                    />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
