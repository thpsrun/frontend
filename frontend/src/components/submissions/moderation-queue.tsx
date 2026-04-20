import { useState } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import {
    ExternalLink, CheckCircle, XCircle, Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { VerifyDialog } from "@/components/submissions/verify-dialog"
import {
    ChangePlayersDialog,
} from "@/components/submissions/change-players-dialog"
import {
    SyncStatusBadge,
} from "@/components/submissions/sync-status-badge"
import type {
    ModerationGameGroup, PendingRun,
} from "@/types/submissions"

function ModRunRow({
    run,
    idx,
}: {
    run: PendingRun
    idx: number
}) {
    const [verifyOpen, setVerifyOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [playersOpen, setPlayersOpen] = useState(false)

    const levelLabel = run.level
        ? `${run.category.name} - ${run.level.name}`
        : run.category.name

    return (
        <>
            <TableRow className={cn(
                "transition hover:bg-muted/30",
                idx % 2 === 1 ? "bg-muted/10" : "",
            )}>
                <TableCell className="text-sm">
                    <div className="flex flex-col">
                        <span>{levelLabel}</span>
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
                <TableCell className="text-sm">
                    {run.players.map((p, i) => (
                        <span key={p.id}>
                            {i > 0 && ", "}
                            <Link
                                to={`/player/${p.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "text-link",
                                    "hover:underline",
                                )}
                            >
                                {p.name}
                            </Link>
                        </span>
                    ))}
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
                                <ExternalLink
                                    className="size-3"
                                />
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
                                <ExternalLink
                                    className="size-3"
                                />
                                SRC
                            </a>
                        )}
                    </div>
                </TableCell>
                <TableCell className="text-center">
                    <SyncStatusBadge sync={run.src_sync} />
                </TableCell>
                <TableCell>
                    <div className={cn(
                        "flex items-center",
                        "justify-center gap-0.5",
                    )}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                                "size-7 text-success",
                                "hover:text-success",
                                "hover:bg-success/10",
                            )}
                            title="Verify"
                            onClick={() => setVerifyOpen(true)}
                        >
                            <CheckCircle
                                className="size-3.5"
                            />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                                "size-7 text-destructive",
                                "hover:text-destructive",
                                "hover:bg-destructive/10",
                            )}
                            title="Reject"
                            onClick={() => setRejectOpen(true)}
                        >
                            <XCircle
                                className="size-3.5"
                            />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            title="Change Players"
                            onClick={() => setPlayersOpen(true)}
                        >
                            <Users className="size-3.5" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            <VerifyDialog
                run={run}
                open={verifyOpen}
                onOpenChange={setVerifyOpen}
            />
            <VerifyDialog
                run={run}
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                defaultAction="rejected"
            />
            <ChangePlayersDialog
                run={run}
                open={playersOpen}
                onOpenChange={setPlayersOpen}
            />
        </>
    )
}

function GameGroup({ group }: { group: ModerationGameGroup }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Link
                    to={`/${group.game_slug}`}
                    className={cn(
                        "text-sm font-semibold",
                        "text-link hover:underline",
                    )}
                >
                    {group.game_name}
                </Link>
                <Badge variant="secondary">
                    {group.pending_count} pending
                </Badge>
            </div>

            <div className={cn(
                "rounded-md border",
                "border-border/40 overflow-hidden",
            )}>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/20">
                            <TableHead
                                className="text-center"
                            >
                                Category
                            </TableHead>
                            <TableHead
                                className="text-center"
                            >
                                Player
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
                            <TableHead
                                className="text-center"
                            >
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {group.pending_runs.map(
                            (run, idx) => (
                                <ModRunRow
                                    key={run.id}
                                    run={run}
                                    idx={idx}
                                />
                            ),
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export function ModerationQueue({
    groups,
}: {
    groups: ModerationGameGroup[]
}) {
    if (groups.length === 0) return null

    return (
        <Panel className="p-5">
            <h2 className="text-xl font-semibold mb-4">
                Moderation Queue
            </h2>

            <div className="space-y-6">
                {groups.map((group) => (
                    <GameGroup
                        key={group.game_id}
                        group={group}
                    />
                ))}
            </div>
        </Panel>
    )
}
