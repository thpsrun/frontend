import { Link } from "react-router"
import { useSubmissions } from "@/hooks/submissions/useSubmissions"
import { ModerationQueue } from "@/components/submissions/moderation-queue"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Badge } from "@/components/ui/badge"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { Info, ExternalLink, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    SyncStatusBadge,
} from "@/components/submissions/sync-status-badge"
import type { PendingRun } from "@/types/submissions"

function PendingRunRow({
    run,
    idx,
}: {
    run: PendingRun
    idx: number
}) {
    return (
        <TableRow className={cn(
            "transition hover:bg-muted/30",
            idx % 2 === 1 ? "bg-muted/10" : "",
        )}>
            <TableCell className="text-sm">
                <Link
                    to={`/${run.game.slug}`}
                    className={cn(
                        "text-link hover:underline",
                        "font-medium",
                    )}
                >
                    {run.game.name}
                </Link>
            </TableCell>
            <TableCell className="text-sm">
                <div className="flex flex-col">
                    <span>{run.subcategory}</span>
                    {run.description && (
                        <span className={cn(
                            "text-xs text-muted-foreground",
                            "italic mt-0.5",
                        )}>
                            {run.description}
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell className={cn(
                "font-mono tabular-nums tracking-tight",
                "text-sm text-center",
            )}>
                {run.times.p_time}
            </TableCell>
            <TableCell className="text-xs text-center">
                {new Date(run.date).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <div className={cn(
                    "flex items-center",
                    "justify-center gap-2",
                )}>
                    {run.video && (
                        <a
                            href={run.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center",
                                "gap-1 text-xs",
                                "text-link hover:underline",
                            )}
                        >
                            <ExternalLink className="size-3" />
                            Video
                        </a>
                    )}
                    {run.url && (
                        <a
                            href={run.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center",
                                "gap-1 text-xs",
                                "text-link hover:underline",
                            )}
                        >
                            <ExternalLink className="size-3" />
                            SRC
                        </a>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-center">
                <SyncStatusBadge sync={run.src_sync} />
            </TableCell>
        </TableRow>
    )
}

export function SubmissionsHub() {
    const { data, isLoading, error } = useSubmissions()

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className={cn(
                    "flex items-center gap-2",
                    "text-muted-foreground",
                )}>
                    <Loader2 className="size-4 animate-spin" />
                    Loading submissions...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8">
                <AlertBanner variant="error">
                    {error.message}
                </AlertBanner>
            </div>
        )
    }

    return (
        <div className={cn(
            "mx-auto max-w-5xl px-4 py-8",
            "space-y-6",
        )}>
            <div className={cn(
                "flex items-start gap-2.5 rounded-lg",
                "border border-border/40",
                "bg-background/70 backdrop-blur-sm",
                "shadow-sm",
                "px-4 py-3 text-sm",
                "text-muted-foreground",
            )}>
                <Info className={cn(
                    "size-4 mt-0.5 shrink-0",
                    "text-link",
                )} />
                <span>
                    Runs can be submitted on this site, but cannot
                    be directly edited by the user or moderators.
                    If you need to make changes, go to{" "}
                    <a
                        href="https://www.speedrun.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "text-link hover:underline",
                        )}
                    >
                        speedrun.com
                    </a>
                    {" "}directly.
                </span>
            </div>

            <section className={cn(
                "rounded-lg border border-border/40",
                "bg-background/70 backdrop-blur-sm",
                "shadow-sm p-5",
            )}>
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold">
                        My Pending Runs
                    </h2>
                    {data && data.pending_runs.length > 0 && (
                        <Badge variant="secondary">
                            {data.pending_runs.length}
                        </Badge>
                    )}
                </div>

                {data?.pending_runs.length === 0 ? (
                    <div className={cn(
                        "text-sm text-muted-foreground",
                        "py-6 text-center",
                        "border border-dashed",
                        "border-border/40 rounded-md",
                    )}>
                        No pending runs.
                    </div>
                ) : (
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
                                        Game
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Category
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Time
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Date
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Links
                                    </TableHead>
                                    <TableHead
                                        className="text-center"
                                    >
                                        Sync
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.pending_runs.map(
                                    (run, idx) => (
                                        <PendingRunRow
                                            key={run.id}
                                            run={run}
                                            idx={idx}
                                        />
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>

            {data?.moderation_queue && (
                <ModerationQueue
                    groups={data.moderation_queue}
                />
            )}
        </div>
    )
}
