import { useMemo, useState } from "react"
import { useParams } from "react-router"
import {
    ChevronDown, ChevronRight, RotateCcw, ScrollText, KeyRound,
    User, Bot, Cog,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"
import { Pagination } from "@/components/ui/pagination"
import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/common/query-error-banner"
import { TableSkeleton } from "@/components/common/table-skeleton"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { useGameAuditEntry, useGameAuditLog } from "@/hooks/game/useGameAudit"
import { cn, formatDate } from "@/lib/utils"
import {
    EVENT_GROUP_LABEL,
    EVENT_GROUP_TYPES,
    EVENT_TYPE_LABEL,
    type AuditActorKind,
    type AuditEntry,
    type AuditEventGroup,
    type AuditEventType,
    type AuditListParams,
    type AuditPayload,
    type ApiKeyRevokedPayload,
    type ModeratorChangePayload,
    type RecalcBoardPayload,
    type RecalcDispatchPayload,
    type RunRecalcPayload,
    type SrcSyncAttemptPayload,
    type TimingConfigChangePayload,
} from "@/types/audit"

const PAGE_SIZE = 50

const GROUP_ORDER: ReadonlyArray<AuditEventGroup> = [
    "timing", "recalc", "src", "moderators", "keys",
]

const ACTOR_ICON: Record<AuditActorKind, typeof User> = {
    user: User,
    api_key: KeyRound,
    system: Bot,
}

function expandedEventTypes(group: AuditEventGroup | null): AuditEventType[] | undefined {
    if (!group) return undefined
    return [...EVENT_GROUP_TYPES[group]]
}

function ActorCell({ entry }: { entry: AuditEntry }) {
    const Icon = ACTOR_ICON[entry.actor_kind]
    const display = entry.actor_kind === "api_key" && entry.actor_username
        ? `${entry.actor_label} (${entry.actor_username})`
        : entry.actor_label || entry.actor_username || "-"
    return (
        <span className="inline-flex items-center gap-1.5 text-xs">
            <Icon className="size-3 text-muted-foreground" />
            <span>{display}</span>
            {entry.actor_kind === "api_key" && (
                <Badge variant="outline" className="text-[10px]">Key</Badge>
            )}
            {entry.actor_kind === "system" && (
                <Badge variant="secondary" className="text-[10px]">System</Badge>
            )}
        </span>
    )
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
    return (
        <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground min-w-32 shrink-0">{k}</span>
            <span className="break-all">{v}</span>
        </div>
    )
}

function renderJson(value: unknown): React.ReactNode {
    if (value === null || value === undefined) {
        return <span className="text-muted-foreground italic">Null</span>
    }
    if (typeof value === "string") return value
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    return (
        <pre className="bg-muted/30 rounded px-2 py-1 text-[10px] overflow-auto min-w-md max-h-96 mt-1">
            {JSON.stringify(value, null, 2)}
        </pre>
    )
}

function PayloadView({ type, payload }: {
    type: AuditEventType
    payload: AuditPayload
}) {
    switch (type) {
        case "timing_config_change": {
            const p = payload as TimingConfigChangePayload
            return (
                <div className="flex flex-col gap-1">
                    <KV k="Model" v={<code>{p.model}</code>} />
                    <KV k="Field" v={<code>{p.field}</code>} />
                    <KV k="Previous" v={renderJson(p.previous)} />
                    <KV k="New" v={renderJson(p.new)} />
                    {p.recalc_dispatched && (
                        <KV k="Recalculation Dispatched" v="yes" />
                    )}
                    {p.rebackfill_dispatched && (
                        <KV k="Re-backfill Dispatched" v="yes" />
                    )}
                </div>
            )
        }
        case "recalc_dispatch": {
            const p = payload as RecalcDispatchPayload
            return (
                <div className="flex flex-col gap-1">
                    <KV k="Boards" v={p.boards_count} />
                    <KV k="Runs Scanned" v={p.runs_scanned} />
                    <KV k="Duration (ms)" v={p.duration_ms} />
                    <KV k="Triggered By" v={<code>{p.triggered_by}</code>} />
                </div>
            )
        }
        case "recalc_board": {
            const p = payload as RecalcBoardPayload
            return (
                <div className="flex flex-col gap-1">
                    <KV k="Category" v={<code>{p.category_id}</code>} />
                    <KV k="Level" v={p.level_id ? <code>{p.level_id}</code> : "-"} />
                    <KV k="Run Type" v={p.runtype} />
                    <KV k="Variable Values" v={renderJson(p.variable_value_map)} />
                    <KV k="Entries Created" v={p.entries_created} />
                    <KV k="Runs Processed" v={p.runs_processed} />
                    <KV k="Runs Updated" v={p.runs_updated} />
                </div>
            )
        }
        case "run_recalc": {
            const p = payload as RunRecalcPayload
            return (
                <div className="flex flex-col gap-1">
                    <KV k="Run" v={<code>{p.run_id}</code>} />
                    <KV k="Cause" v={p.cause} />
                    <KV k="With Streaks" v={p.with_streaks ? "yes" : "no"} />
                </div>
            )
        }
        case "src_sync_attempt": {
            const p = payload as SrcSyncAttemptPayload
            return (
                <div className="flex flex-col gap-1">
                    <KV k="Run" v={<code>{p.run_id}</code>} />
                    <KV k="Action" v={p.action} />
                    <KV k="Status" v={
                        <Badge variant={p.status === "synced" ? "default" : "destructive"}>
                            {p.status}
                        </Badge>
                    } />
                    <KV k="Attempts" v={p.attempts} />
                    {p.error_category && (
                        <KV k="Error Category" v={p.error_category} />
                    )}
                    {p.last_error && (
                        <KV k="Last Error" v={
                            <span className="text-destructive">{p.last_error}</span>
                        } />
                    )}
                </div>
            )
        }
        case "moderator_added":
        case "moderator_removed": {
            const p = payload as ModeratorChangePayload
            return (
                <div className="flex flex-col gap-1">
                    <KV k="Player" v={p.player_name} />
                    <KV k="Player ID" v={<code>{p.player_id}</code>} />
                    <KV k="User ID" v={p.user_id ?? "-"} />
                </div>
            )
        }
        case "apikey_revoked": {
            const p = payload as ApiKeyRevokedPayload
            return (
                <div className="flex flex-col gap-1">
                    <KV k="Key" v={`${p.key_label} (#${p.key_id})`} />
                    <KV k="User ID" v={p.user_id ?? "-"} />
                    <KV k="Reason" v={p.reason} />
                    <KV k="Cause" v={p.cause} />
                </div>
            )
        }
    }
}

interface RowProps {
    entry: AuditEntry
    expanded: boolean
    onToggle: () => void
    gameSlug: string
    idx: number
}

function AuditRow({ entry, expanded, onToggle, gameSlug, idx }: RowProps) {
    const detail = useGameAuditEntry(gameSlug, entry.id, expanded)

    const stripe = idx % 2 === 1 ? "bg-muted/10" : ""

    return (
        <>
            <TableRow
                className={cn(
                    "cursor-pointer transition hover:bg-muted/30",
                    stripe,
                )}
                onClick={onToggle}
            >
                <TableCell className="w-6 text-muted-foreground">
                    {expanded
                        ? <ChevronDown className="size-3" />
                        : <ChevronRight className="size-3" />}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(entry.created_at)}
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                        {EVENT_TYPE_LABEL[entry.event_type]}
                    </Badge>
                </TableCell>
                <TableCell><ActorCell entry={entry} /></TableCell>
                <TableCell className="text-xs">{entry.summary}</TableCell>
            </TableRow>
            {expanded && (
                <TableRow className={cn(stripe)}>
                    <TableCell colSpan={5} className="bg-muted/5 py-3">
                        {detail.isLoading && (
                            <p className="text-xs text-muted-foreground">
                                Loading Details...
                            </p>
                        )}
                        {detail.error && (
                            <p className="text-xs text-destructive">
                                Failed to Load Details...
                            </p>
                        )}
                        {detail.data?.payload && (
                            <PayloadView
                                type={detail.data.event_type}
                                payload={detail.data.payload}
                            />
                        )}
                        {detail.data && !detail.data.payload && (
                            <p className="text-xs text-muted-foreground">
                                No payload recorded for this event?
                            </p>
                        )}
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}

export function AuditSection() {
    const { gameSlug } = useParams<{ gameSlug: string }>()
    const [group, setGroup] = useState<AuditEventGroup | null>(null)
    const [offset, setOffset] = useState(0)
    const [expandedId, setExpandedId] = useState<number | null>(null)

    const params = useMemo<AuditListParams>(() => ({
        event_type: expandedEventTypes(group),
        limit: PAGE_SIZE,
        offset,
    }), [group, offset])

    const { data, isLoading, error, refetch, isFetching } =
        useGameAuditLog(gameSlug, params)

    const total = data?.count ?? 0
    const totalPages = total ? Math.ceil(total / PAGE_SIZE) : 0
    const currentPage = Math.floor(offset / PAGE_SIZE) + 1

    const handleGroupChange = (value: string) => {
        setGroup(value ? (value as AuditEventGroup) : null)
        setOffset(0)
        setExpandedId(null)
    }

    return (
        <div className="space-y-4">
            <Panel>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">Audit Log</h2>
                        <p className="text-sm text-muted-foreground">
                            Logs and information on past events in this game.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="gap-1"
                    >
                        <RotateCcw className="size-3" />
                        Refresh
                    </Button>
                </div>
            </Panel>

            {error && (
                <QueryErrorBanner error={error} onRetry={refetch} />
            )}

            <Panel className="p-5">
                <div className="flex flex-col gap-2 mb-4">
                    <span className="text-xs text-muted-foreground">
                        <Cog className="size-3 inline -mt-0.5 mr-1" />
                        Filter
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        <ToggleGroup
                            type="single"
                            size="sm"
                            variant="outline"
                            value={group ?? ""}
                            onValueChange={handleGroupChange}
                            className={cn(
                                "grid w-full grid-cols-2 gap-1 sm:grid-cols-3",
                                "min-[1334px]:flex min-[1334px]:w-fit min-[1334px]:gap-0",
                            )}
                        >
                            {GROUP_ORDER.map((g) => (
                                <ToggleGroupItem
                                    key={g}
                                    value={g}
                                    aria-label={EVENT_GROUP_LABEL[g]}
                                    className={cn(
                                        "rounded-md border data-[variant=outline]:border-l",
                                        "min-[1334px]:rounded-none min-[1334px]:px-6",
                                        "min-[1334px]:first:rounded-l-md min-[1334px]:last:rounded-r-md",
                                        "min-[1334px]:data-[variant=outline]:border-l-0",
                                        "min-[1334px]:data-[variant=outline]:first:border-l",
                                    )}
                                >
                                    {EVENT_GROUP_LABEL[g]}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                        {group && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setGroup(null); setOffset(0) }}
                                className="text-xs shrink-0"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton
                        columns={5}
                        rows={8}
                        headers={["", "When", "Event", "Actor", "Summary"]}
                    />
                ) : (
                    <div className="rounded-md border border-border/40 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20">
                                    <TableHead className="w-6" />
                                    <TableHead>When</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Summary</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data && data.results.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-0">
                                            <EmptyState
                                                inset
                                                icon={ScrollText}
                                                title="No Audit Events... Yet."
                                                description=""
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.results.map((entry, idx) => (
                                        <AuditRow
                                            key={entry.id}
                                            entry={entry}
                                            expanded={expandedId === entry.id}
                                            onToggle={() => setExpandedId(
                                                expandedId === entry.id ? null : entry.id,
                                            )}
                                            gameSlug={gameSlug ?? ""}
                                            idx={idx}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                        setOffset((p - 1) * PAGE_SIZE)
                        setExpandedId(null)
                    }}
                    totalLabel={`${total} Total Events`}
                />
            </Panel>
        </div>
    )
}
