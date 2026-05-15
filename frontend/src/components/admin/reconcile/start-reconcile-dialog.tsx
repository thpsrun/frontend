import { useState, type ReactNode } from "react"
import { Link } from "react-router"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertBanner } from "@/components/ui/alert-banner"
import { MetaRow } from "@/components/ui/meta-row"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useStartReconcile } from "@/hooks/admin/useReconcile"
import { ApiError } from "@/lib/api-client"
import { getErrorMessage } from "@/lib/utils"
import { GamePicker } from "./game-picker"
import {
    LeaderboardTargetBuilder,
    type BuilderValue,
} from "./leaderboard-target-builder"
import { ConfirmStartReconcileDialog } from "./confirm-start-reconcile-dialog"
import {
    SCOPE_LABEL,
    SOURCE_LABEL,
    type ConflictOut,
    type ReconcileScope,
    type SourceOfTruth,
    type ReconcileRequest,
} from "@/types/reconcile"
import type { Game } from "@/types/api"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreated?: (jobId: string) => void
}

const SCOPE_HINT: Record<ReconcileScope, string> = {
    GAME: "Reconciles all leaderboards under a game.",
    LEADERBOARD: "Reconciles a single leaderboard (category, optional level + variables).",
    RUN: "Reconciles a single run by ID.",
    SERIES: "Scans every series in the database for newly added games on Speedrun.com. Existing games are skipped, refresh those with the GAME scope.",
}

const SCOPE_OPTIONS: ReconcileScope[] = ["GAME", "LEADERBOARD", "RUN", "SERIES"]
const SOURCE_OPTIONS: SourceOfTruth[] = ["SRC", "THPS_RUN"]

function otherSide(source: SourceOfTruth): string {
    return source === "SRC" ? SOURCE_LABEL.THPS_RUN : SOURCE_LABEL.SRC
}

function conflictCopy(scope: ReconcileScope): string {
    switch (scope) {
        case "SERIES":
            return "A series reconciliation is already running!"
        case "GAME":
            return "A reconciliation for this game is already running!"
        case "RUN":
            return "A reconciliation for this run is already running!"
        case "LEADERBOARD":
            return "A reconciliation for this leaderboard is already running!"
    }
}

interface ConflictState {
    scope: ReconcileScope
    existingJobId: string
}

export function StartReconcileDialog({ open, onOpenChange, onCreated }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                {open && (
                    <StartReconcileForm
                        onClose={() => onOpenChange(false)}
                        onCreated={onCreated}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

function StartReconcileForm({
    onClose,
    onCreated,
}: {
    onClose: () => void
    onCreated?: (jobId: string) => void
}) {
    const [scope, setScope] = useState<ReconcileScope>("GAME")
    const [sourceOfTruth, setSourceOfTruth] = useState<SourceOfTruth>("SRC")
    const [selectedGame, setSelectedGame] = useState<Game | null>(null)
    const [runIdInput, setRunIdInput] = useState("")
    const [builder, setBuilder] = useState<BuilderValue>({
        game: null,
        category: null,
        level: null,
        variableValues: {},
    })

    const [topError, setTopError] = useState<string | null>(null)
    const [conflict, setConflict] = useState<ConflictState | null>(null)
    const [fieldError, setFieldError] = useState<string | null>(null)

    const [pendingBody, setPendingBody] = useState<ReconcileRequest | null>(null)
    const [pendingSummary, setPendingSummary] = useState<ReactNode>(null)

    const start = useStartReconcile()
    const isPending = start.isPending

    function onClickStart(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        setTopError(null)
        setConflict(null)
        setFieldError(null)

        if (scope === "GAME") {
            if (!selectedGame) {
                setFieldError("Pick a game.")
                return
            }
            const body: ReconcileRequest = {
                scope: "GAME",
                source_of_truth: sourceOfTruth,
                target_id: selectedGame.slug,
                target_descriptor: null,
            }
            setPendingBody(body)
            setPendingSummary(
                <SummaryGame game={selectedGame} />,
            )
            return
        }

        if (scope === "RUN") {
            const trimmed = runIdInput.trim()
            if (!trimmed) {
                setFieldError("Enter a run ID.")
                return
            }
            const body: ReconcileRequest = {
                scope: "RUN",
                source_of_truth: sourceOfTruth,
                target_id: trimmed,
                target_descriptor: null,
            }
            setPendingBody(body)
            setPendingSummary(<SummaryRun runId={trimmed} />)
            return
        }

        if (scope === "SERIES") {
            const body: ReconcileRequest = {
                scope: "SERIES",
                source_of_truth: sourceOfTruth,
            }
            setPendingBody(body)
            setPendingSummary(<SummarySeries />)
            return
        }

        const { game, category, level, variableValues } = builder
        if (!game || !category) {
            setFieldError("Pick a game and a category.")
            return
        }
        if (category.type === "per-level" && !level) {
            setFieldError("Pick a level for per-level categories.")
            return
        }
        const body: ReconcileRequest = {
            scope: "LEADERBOARD",
            source_of_truth: sourceOfTruth,
            target_id: null,
            target_descriptor: {
                game_id: game.id,
                category_id: category.id,
                level_id: level?.id ?? null,
                variable_values: variableValues,
            },
        }
        setPendingBody(body)
        setPendingSummary(
            <SummaryLeaderboard builder={builder} />,
        )
    }

    async function handleConfirm() {
        if (!pendingBody) return
        const submittedScope = pendingBody.scope
        try {
            const job = await start.mutateAsync(pendingBody)
            setPendingBody(null)
            setPendingSummary(null)
            onClose()
            onCreated?.(job.id)
        } catch (err) {
            setPendingBody(null)
            setPendingSummary(null)
            if (err instanceof ApiError && err.status === 409) {
                const body = err.body as ConflictOut | undefined
                if (body && typeof body.existing_job_id === "string") {
                    setConflict({
                        scope: submittedScope,
                        existingJobId: body.existing_job_id,
                    })
                    return
                }
            }
            setTopError(getErrorMessage(err, "Failed to start reconciliation."))
        }
    }

    const submitDisabled = isPending || (
        scope === "GAME" ? !selectedGame
            : scope === "RUN" ? !runIdInput.trim()
                : scope === "SERIES" ? false
                    : !builder.game || !builder.category
                        || (builder.category.type === "per-level" && !builder.level)
    )

    return (
        <>
            <form onSubmit={onClickStart} className="flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>Start Reconciliation</DialogTitle>
                    <DialogDescription>
                        Queue a reconciliation job between thps.run and Speedrun.com.
                    </DialogDescription>
                </DialogHeader>

                {conflict && (
                    <AlertBanner variant="error">
                        <div className="flex flex-col gap-1.5">
                            <span>{conflictCopy(conflict.scope)}</span>
                            <Link
                                to={`/admin/reconcile/${conflict.existingJobId}`}
                                className="text-xs underline underline-offset-2"
                                onClick={onClose}
                            >
                                View running job
                            </Link>
                        </div>
                    </AlertBanner>
                )}

                {topError && (
                    <AlertBanner variant="error">{topError}</AlertBanner>
                )}

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="reconcile-scope">Scope</Label>
                        <Select
                            value={scope}
                            onValueChange={(v) => {
                                setFieldError(null)
                                setConflict(null)
                                setScope(v as ReconcileScope)
                            }}
                            disabled={isPending}
                        >
                            <SelectTrigger id="reconcile-scope">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SCOPE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {SCOPE_LABEL[opt]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {SCOPE_HINT[scope]}
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="reconcile-source">Source of Truth</Label>
                        <Select
                            value={sourceOfTruth}
                            onValueChange={(v) => setSourceOfTruth(v as SourceOfTruth)}
                            disabled={isPending}
                        >
                            <SelectTrigger id="reconcile-source">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SOURCE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {SOURCE_LABEL[opt]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {SOURCE_LABEL[sourceOfTruth]} is authoritative. Differences on{" "}
                            {otherSide(sourceOfTruth)} will be overwritten.
                        </p>
                    </div>

                    {scope === "GAME" && (
                        <div className="space-y-1.5">
                            <Label>Game</Label>
                            <GamePicker
                                selected={selectedGame}
                                onSelect={setSelectedGame}
                                disabled={isPending}
                            />
                        </div>
                    )}

                    {scope === "RUN" && (
                        <div className="space-y-1.5">
                            <Label htmlFor="reconcile-run-id">Run ID</Label>
                            <Input
                                id="reconcile-run-id"
                                value={runIdInput}
                                onChange={(e) => setRunIdInput(e.target.value)}
                                placeholder="e.g. 7d3k1m2x"
                                autoComplete="off"
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                The Speedrun.com run ID.
                            </p>
                        </div>
                    )}

                    {scope === "LEADERBOARD" && (
                        <LeaderboardTargetBuilder
                            value={builder}
                            onChange={setBuilder}
                            disabled={isPending}
                        />
                    )}

                    {fieldError && (
                        <p className="text-sm text-destructive">{fieldError}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitDisabled}>
                        Start
                    </Button>
                </DialogFooter>
            </form>

            <ConfirmStartReconcileDialog
                open={pendingBody !== null}
                onOpenChange={(next) => {
                    if (!next) {
                        setPendingBody(null)
                        setPendingSummary(null)
                    }
                }}
                summary={pendingSummary}
                sourceLabel={SOURCE_LABEL[sourceOfTruth]}
                targetLabel={otherSide(sourceOfTruth)}
                isPending={isPending}
                onConfirm={handleConfirm}
            />
        </>
    )
}

function SummaryGame({ game }: { game: Game }) {
    return (
        <div className="space-y-1.5">
            <MetaRow dense label="Scope">{SCOPE_LABEL.GAME}</MetaRow>
            <MetaRow dense label="Game">
                {game.name}{" "}
                <span className="font-mono text-xs text-muted-foreground">
                    ({game.slug})
                </span>
            </MetaRow>
        </div>
    )
}

function SummaryRun({ runId }: { runId: string }) {
    return (
        <div className="space-y-1.5">
            <MetaRow dense label="Scope">{SCOPE_LABEL.RUN}</MetaRow>
            <MetaRow dense label="Run ID">
                <span className="font-mono text-xs">{runId}</span>
            </MetaRow>
        </div>
    )
}

function SummarySeries() {
    return (
        <div className="space-y-1.5">
            <MetaRow dense label="Scope">{SCOPE_LABEL.SERIES}</MetaRow>
            <MetaRow dense label="Target">All Series in Database</MetaRow>
        </div>
    )
}

function SummaryLeaderboard({ builder }: { builder: BuilderValue }) {
    const { game, category, level, variableValues } = builder
    const variableEntries = Object.entries(variableValues)
    const allVars = [
        ...(category?.variables ?? []),
        ...(level?.variables ?? []),
    ]

    return (
        <div className="space-y-1.5">
            <MetaRow dense label="Scope">{SCOPE_LABEL.LEADERBOARD}</MetaRow>
            {game && (
                <MetaRow dense label="Game">{game.name}</MetaRow>
            )}
            {category && (
                <MetaRow dense label="Category">
                    {category.name}{" "}
                    <span className="text-xs text-muted-foreground">
                        ({category.type === "per-level" ? "IL" : "FG"})
                    </span>
                </MetaRow>
            )}
            {level && (
                <MetaRow dense label="Level">{level.name}</MetaRow>
            )}
            {variableEntries.length > 0 && (
                <div className="pt-1">
                    <span className="text-xs text-muted-foreground">Variables</span>
                    <div className="mt-1 space-y-0.5">
                        {variableEntries.map(([variableId, value]) => {
                            const variable = allVars.find((v) => v.id === variableId)
                            const valueDef = variable?.values.find(
                                (val) => val.value === value,
                            )
                            return (
                                <MetaRow
                                    key={variableId}
                                    dense
                                    label={variable?.name ?? variableId}
                                >
                                    {valueDef?.name ?? value}
                                </MetaRow>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
