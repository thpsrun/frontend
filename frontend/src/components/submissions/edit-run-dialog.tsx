import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AlertBanner } from "@/components/common/alert-banner"
import { Textarea } from "@/components/ui/textarea"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { BookOpen, Loader2, Users } from "lucide-react"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useResolveTiming } from "@/hooks/game/useResolveTiming"
import { useRun } from "@/hooks/runs/useRun"
import { useUpdateRun } from "@/hooks/submissions/useUpdateRun"
import { useSubmissions } from "@/hooks/submissions/useSubmissions"
import { useSendBackForReview } from "@/hooks/submissions/useSendBackForReview"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useIsWide } from "@/hooks/useIsWide"
import { parseValidationErrors } from "@/lib/validation-errors"
import { validateReviewNotes } from "@/lib/validation"
import { ApiError } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import {
    buildActiveSelection,
    buildRulesSections,
    type RulesView,
} from "@/lib/rules"
import { RulesPanel } from "@/components/rules/rules-panel"
import { RulesDialog } from "@/components/rules/rules-dialog"
import {
    TimeRow, type TimeFields,
    parseTimeSecs, isValidYouTubeUrl,
    getYouTubeEmbedUrl,
    SectionLabel, Divider, ReadOnlyField,
    CategoryVariableGrid, PlatformEmulatedRow,
    buildDefaultVariables, timeFieldsToSecs,
} from "@/components/submissions/run-form-helpers"
import {
    ChangePlayersDialog,
} from "@/components/submissions/change-players-dialog"
import { ReviewNotesBanner } from "@/components/submissions/review-notes-banner"
import { ImportIssuesBanner } from "@/components/submissions/import-issues-banner"
import { SendBackDialog } from "@/components/submissions/send-back-dialog"
import { AcceptVideoDialog } from "@/components/submissions/accept-video-dialog"
import {
    computeUnresolvedIssues,
    formatTimingMethods,
} from "@/components/submissions/import-issues"
import {
    ModeratorVerdictSection,
    type RunStatusChoice,
} from "@/components/submissions/moderator-verdict-section"
import {
    UnsavedChangesDialog,
} from "@/components/profile/unsaved-changes-dialog"

import type {
    GameDetail, RunDetail,
} from "@/types/api"
import type {
    PendingRun, RunUpdateRequest,
} from "@/types/submissions"

const EMPTY_RULES_VIEW: RulesView = { sections: [], hasAny: false }

interface EditRunDialogProps {
    run: PendingRun
    isMine?: boolean
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditRunDialog({
    run, isMine = false, open, onOpenChange,
}: EditRunDialogProps) {
    const runQuery = useRun(run.id, { enabled: open })
    const gameQuery = useGameDetail(run.game.slug, { enabled: open })
    const updateRun = useUpdateRun()
    const { verifyReject } = useSubmissions()
    const sendBack = useSendBackForReview()

    const isLoading = runQuery.isLoading || gameQuery.isLoading
    const loadError = runQuery.error ?? gameQuery.error
    const detail = runQuery.data
    const gameDetail = gameQuery.data

    // Refs rather than state: the form keeps these in sync, and this parent only reads them
    // inside the close handler, so their changes never need to trigger a re-render here.
    const [discardOpen, setDiscardOpen] = useState(false)
    const isDirtyRef = useRef(false)
    const saveRef = useRef<(() => void) | null>(null)

    const [rulesOpen, setRulesOpen] = useState(false)
    const [rulesView, setRulesView] = useState<RulesView>(EMPTY_RULES_VIEW)
    const isWide = useIsWide()

    const isSaving = (
        updateRun.isPending
        || verifyReject.isPending
        || sendBack.isPending
    )

    const handleDialogOpenChange = (next: boolean) => {
        if (next) {
            onOpenChange(true)
            return
        }
        if (isSaving) return
        if (isDirtyRef.current) {
            setDiscardOpen(true)
            return
        }
        setRulesOpen(false)
        onOpenChange(false)
    }

    const handleClose = () => {
        isDirtyRef.current = false
        setRulesOpen(false)
        onOpenChange(false)
    }

    const handleDiscard = () => {
        setDiscardOpen(false)
        handleClose()
    }

    const handleSaveFromDiscard = () => {
        setDiscardOpen(false)
        saveRef.current?.()
    }

    const showSplit = rulesOpen && isWide

    return (
        <>
            <Dialog open={open} onOpenChange={handleDialogOpenChange}>
                <DialogContent
                    className={cn(
                        showSplit
                            ? "h-[90vh] max-w-375 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:grid-rows-1 md:gap-6 overflow-hidden"
                            : "max-h-[90vh] max-w-268.5 overflow-y-auto",
                    )}
                >
                    <div
                        className={cn(
                            showSplit
                                ? "min-w-0 min-h-0 overflow-y-auto"
                                : undefined,
                        )}
                    >
                        <DialogHeader>
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                    <DialogTitle className="font-display text-3xl uppercase tracking-tight leading-none">
                                        Edit Run
                                    </DialogTitle>
                                    <DialogDescription className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium">
                                        {run.game.name}
                                        {run.level ? ` · ${run.level.name}` : ""}
                                        {` · ${run.category.name}`}
                                    </DialogDescription>
                                </div>
                                {rulesView.hasAny && !rulesOpen && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRulesOpen(true)}
                                        className="shrink-0 mt-2.5"
                                    >
                                        <BookOpen className="h-4 w-4 mr-1" />
                                        Show rules
                                    </Button>
                                )}
                            </div>
                        </DialogHeader>

                        {run.vid_status === "review" && run.review_notes && (
                            <ReviewNotesBanner
                                notes={run.review_notes}
                                canResubmit={isMine}
                                runId={run.id}
                            />
                        )}

                        {isLoading && (
                            <div className="flex items-center justify-center py-10 text-muted-foreground">
                                <Loader2 className="size-5 animate-spin" />
                            </div>
                        )}

                        {loadError && !isLoading && (
                            <AlertBanner variant="error">
                                {loadError.message}
                            </AlertBanner>
                        )}

                        {!isLoading && !loadError && detail && gameDetail && (
                            <EditRunForm
                                run={run}
                                detail={detail}
                                gameDetail={gameDetail}
                                updateRun={updateRun}
                                verifyReject={verifyReject}
                                sendBack={sendBack}
                                isSaving={isSaving}
                                isDirtyRef={isDirtyRef}
                                saveRef={saveRef}
                                onClose={handleClose}
                                onRequestClose={() => handleDialogOpenChange(false)}
                                onRulesViewChange={setRulesView}
                            />
                        )}
                    </div>

                    {showSplit && (
                        <RulesPanel
                            view={rulesView}
                            onClose={() => setRulesOpen(false)}
                            className="min-w-0 ml-2"
                        />
                    )}
                </DialogContent>
            </Dialog>

            {!isWide && (
                <RulesDialog
                    open={rulesOpen}
                    onOpenChange={setRulesOpen}
                    view={rulesView}
                />
            )}

            <UnsavedChangesDialog
                open={discardOpen}
                onSave={handleSaveFromDiscard}
                onDiscard={handleDiscard}
                onCancel={() => setDiscardOpen(false)}
                isSaving={isSaving}
            />
        </>
    )
}

function runtypeToCategoryType(
    runtype: "main" | "il",
): "per-game" | "per-level" {
    return runtype === "main" ? "per-game" : "per-level"
}

function recordsEqual(
    a: Record<string, string>,
    b: Record<string, string>,
): boolean {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) return false
    return aKeys.every((k) => a[k] === b[k])
}

interface EditRunFormProps {
    run: PendingRun
    detail: RunDetail
    gameDetail: GameDetail
    updateRun: ReturnType<typeof useUpdateRun>
    verifyReject: ReturnType<typeof useSubmissions>["verifyReject"]
    sendBack: ReturnType<typeof useSendBackForReview>
    isSaving: boolean
    isDirtyRef: React.RefObject<boolean>
    saveRef: React.RefObject<(() => void) | null>
    onClose: () => void
    onRequestClose: () => void
    onRulesViewChange: (view: RulesView) => void
}

// All form state seeds from detail/run in useState initializers, so this component must only
// mount once both queries have resolved (the parent guards on that). Radix unmounts the dialog
// content on close, so every open starts from a fresh snapshot of the run.
function EditRunForm({
    run, detail, gameDetail, updateRun, verifyReject, sendBack,
    isSaving, isDirtyRef, saveRef, onClose, onRequestClose,
    onRulesViewChange,
}: EditRunFormProps) {
    const runtype = detail.runtype
    const [categoryId, setCategoryId] = useState<string>(detail.category)
    const [levelId, setLevelId] = useState<string | null>(detail.level)
    const [platformId, setPlatformId] = useState<string>(detail.platform)
    const [emulated, setEmulated] = useState<boolean>(detail.emulated)
    const [video, setVideo] = useState<string>(detail.video ?? "")
    const [archVideo, setArchVideo] = useState<string>(detail.arch_video ?? "")
    const [srcUrl, setSrcUrl] = useState<string>(detail.url ?? "")
    const [description, setDescription] = useState<string>(
        run.description ?? "",
    )
    const [date, setDate] = useState<string>(
        detail.date ? detail.date.slice(0, 10) : "",
    )

    const [rta, setRta] = useState<TimeFields>(
        () => parseTimeSecs(detail.times.time_secs),
    )
    const [nl, setNl] = useState<TimeFields>(
        () => parseTimeSecs(detail.times.timenl_secs),
    )
    const [igt, setIgt] = useState<TimeFields>(
        () => parseTimeSecs(detail.times.timeigt_secs),
    )

    const [variableValues, setVariableValues] = useState<Record<string, string>>(
        () => ({ ...detail.variables }),
    )
    const [error, setError] = useState<string | null>(null)
    const [playersOpen, setPlayersOpen] = useState(false)
    const [sendBackOpen, setSendBackOpen] = useState(false)
    const [acceptVideoOpen, setAcceptVideoOpen] = useState(false)

    const { player } = useCurrentPlayer()
    const isModerator = useMemo(
        () => player?.moderation.moderated_games.some(
            (g) => g.slug === run.game.slug,
        ) ?? false,
        [player, run.game.slug],
    )
    const unresolvedImportIssues = useMemo(
        () => computeUnresolvedIssues(run.import_issues, {
            video, rta, nl, igt,
        }),
        [run.import_issues, video, rta, nl, igt],
    )
    const sendBackDefaultNotes = useMemo(() => {
        const parts: string[] = []
        if (unresolvedImportIssues.missingTimingMethods.length > 0) {
            parts.push(
                "Missing required timing method(s): "
                + formatTimingMethods(
                    unresolvedImportIssues.missingTimingMethods,
                )
                + ".",
            )
        }
        if (unresolvedImportIssues.video !== null) {
            parts.push("Video is not a valid YouTube link.")
        }
        if (parts.length === 0) return ""
        return parts.join(" ") + " Please fix then resubmit."
    }, [unresolvedImportIssues])
    const [runStatus, setRunStatus] = useState<RunStatusChoice>("unchanged")
    const [denyReason, setDenyReason] = useState("")
    const [reviewNotes, setReviewNotes] = useState(run.review_notes ?? "")

    const initial = useMemo(() => ({
        categoryId: detail.category,
        levelId: detail.level,
        platformId: detail.platform,
        emulated: detail.emulated,
        video: detail.video ?? "",
        archVideo: detail.arch_video ?? "",
        srcUrl: detail.url ?? "",
        description: run.description ?? "",
        date: detail.date ? detail.date.slice(0, 10) : "",
        variables: { ...detail.variables },
    }), [detail, run.description])

    const isDirty = (
        categoryId !== initial.categoryId
        || levelId !== initial.levelId
        || platformId !== initial.platformId
        || emulated !== initial.emulated
        || video !== initial.video
        || archVideo !== initial.archVideo
        || srcUrl !== initial.srcUrl
        || description !== initial.description
        || date !== initial.date
        || !recordsEqual(variableValues, initial.variables)
    )

    const availableCategories = useMemo(
        () => gameDetail.categories.filter(
            (c) => c.type === runtypeToCategoryType(runtype) && !c.archive,
        ),
        [gameDetail.categories, runtype],
    )

    const availableLevels = useMemo(
        () => gameDetail.levels ?? [],
        [gameDetail.levels],
    )

    const selectedCategory = useMemo(
        () => availableCategories.find((c) => c.id === categoryId)
            ?? availableCategories[0],
        [availableCategories, categoryId],
    )

    const applicableVariables = useMemo(
        () => selectedCategory?.variables.filter((v) => !v.archive) ?? [],
        [selectedCategory],
    )

    const selectedValueIds = useMemo(
        () => Object.values(variableValues),
        [variableValues],
    )

    const { data: timing } = useResolveTiming(
        gameDetail.slug,
        selectedCategory?.id ?? "",
        runtype === "il" ? levelId : null,
        selectedValueIds,
    )

    // Prefer the live resolution for the currently selected category/level/variables, fall back
    // to the resolution stored on the run, and require all three methods while neither is known.
    const resolvedRequired = timing?.resolved_required_methods
        ?? detail.times.resolved_required_methods
        ?? (["rta", "lrt", "igt"] as const)

    const embedUrl = useMemo(() => getYouTubeEmbedUrl(video), [video])

    const activeLevelObj = useMemo(
        () => availableLevels.find((l) => l.id === levelId),
        [availableLevels, levelId],
    )

    const orderedValueSlugs = useMemo(
        () => applicableVariables.map((variable) => {
            const v = variable.values.find(
                (val) => val.value === variableValues[variable.id],
            )
            return v?.slug ?? ""
        }),
        [applicableVariables, variableValues],
    )

    const rulesView = useMemo(
        () => buildRulesSections(
            gameDetail,
            buildActiveSelection(
                selectedCategory,
                runtype === "il" ? activeLevelObj : undefined,
                orderedValueSlugs,
            ),
        ),
        [gameDetail, selectedCategory, runtype, activeLevelObj, orderedValueSlugs],
    )

    useEffect(() => {
        onRulesViewChange(rulesView)
    }, [rulesView, onRulesViewChange])

    const handleCategoryChange = (newId: string) => {
        setCategoryId(newId)
        const next = availableCategories.find((c) => c.id === newId)
        if (next) setVariableValues(buildDefaultVariables(next))
    }

    const handleVariableChange = (variableId: string, value: string) => {
        setVariableValues((prev) => ({ ...prev, [variableId]: value }))
    }

    // Builds the payload and dispatches the save / verify / deny / send-back
    // mutations. All validation and the import-issue gates live in handleSave;
    // this runs only once they pass, or once the moderator confirms a video
    // override in the accept-video dialog.
    const submitRun = () => {
        const isSendBack = isModerator && runStatus === "review"

        const payload: RunUpdateRequest = {
            category_id: categoryId,
            level_id: runtype === "il" ? levelId : null,
            runtype,
            time_secs: timeFieldsToSecs(rta),
            timenl_secs: timeFieldsToSecs(nl),
            timeigt_secs: timeFieldsToSecs(igt),
            video: video.trim() || null,
            arch_video: archVideo.trim() || null,
            platform_id: platformId,
            description: description.trim() || null,
            emulated,
            date: date || null,
            url: srcUrl.trim() || null,
            variable_values: Object.keys(variableValues).length > 0
                ? variableValues
                : null,
        }

        const formatErr = (err: unknown): string => {
            const parsed = parseValidationErrors(err)
            if (parsed) {
                const firstField = Object.values(parsed.fieldErrors)[0]
                return parsed.formError ?? firstField ?? "Save Failed..."
            }
            if (err instanceof Error) return err.message
            return "Save Failed..."
        }

        // Sending back a timing-incomplete run: the PUT would 422, so call the
        // review endpoint directly and skip saving edits.
        if (
            isSendBack
            && unresolvedImportIssues.missingTimingMethods.length > 0
        ) {
            sendBack.mutate(
                { runId: run.id, notes: reviewNotes },
                {
                    onSuccess: () => {
                        toast.success("Run sent back to runner.")
                        onClose()
                    },
                    onError: (err) => setError(formatErr(err)),
                },
            )
            return
        }

        updateRun.mutate(
            { runId: run.id, data: payload },
            {
                onSuccess: () => {
                    if (!isModerator || runStatus === "unchanged") {
                        toast.success("Run updated.")
                        onClose()
                        return
                    }
                    if (runStatus === "review") {
                        sendBack.mutate(
                            { runId: run.id, notes: reviewNotes },
                            {
                                onSuccess: () => {
                                    toast.success(
                                        run.vid_status === "review"
                                            ? "Run Updated and Review Notes Saved!"
                                            : "Run Updated and Sent Back to Runner!",
                                    )
                                    onClose()
                                },
                                onError: (err) => {
                                    if (err instanceof ApiError) {
                                        if (err.isForbidden) {
                                            setError("You are not a moderator of this game...")
                                            return
                                        }
                                        if (err.isNotFound) {
                                            setError("Run not found...")
                                            return
                                        }
                                        if (err.isConflict || err.isValidation) {
                                            setError(err.message)
                                            return
                                        }
                                    }
                                    setError(formatErr(err))
                                },
                            },
                        )
                        return
                    }
                    verifyReject.mutate(
                        {
                            runId: run.id,
                            data: {
                                status: runStatus,
                                ...(runStatus === "rejected"
                                    ? { reason: denyReason.trim() }
                                    : {}),
                            },
                        },
                        {
                            onSuccess: () => {
                                toast.success(
                                    runStatus === "verified"
                                        ? "Run updated and verified!"
                                        : "Run updated and denied!",
                                )
                                onClose()
                            },
                            onError: (err) => setError(formatErr(err)),
                        },
                    )
                },
                onError: (err) => setError(formatErr(err)),
            },
        )
    }

    const handleSave = () => {
        setError(null)
        const isSendBack = isModerator && runStatus === "review"

        if (runtype === "il" && !levelId) {
            setError("Select a level for IL runs.")
            return
        }
        if (!platformId) {
            setError("Pick a platform before saving.")
            return
        }
        // A run still missing a required timing method cannot be saved (422).
        if (
            !isSendBack
            && unresolvedImportIssues.missingTimingMethods.length > 0
        ) {
            setError(
                "This run is missing required timing ("
                + formatTimingMethods(
                    unresolvedImportIssues.missingTimingMethods,
                )
                + "). Send it back to the runner.",
            )
            return
        }

        // A bad video is only overridable (via the type-to-confirm dialog) when it arrived
        // through import; a hand-entered non-YouTube link is a hard error.
        const videoBad = !isSendBack && !!video && !isValidYouTubeUrl(video)
        const videoOverridable = videoBad
            && unresolvedImportIssues.video !== null
        if (videoBad && !videoOverridable) {
            setError("Video URL must be a valid YouTube link.")
            return
        }

        if (isModerator && runStatus === "rejected" && !denyReason.trim()) {
            setError("Provide a reason when denying a run.")
            return
        }
        if (isModerator && runStatus === "review") {
            const notesError = validateReviewNotes(reviewNotes)
            if (notesError) {
                setError(notesError)
                return
            }
        }

        // Surfaced last, so the override prompt only appears when accepting the
        // bad video is the one remaining thing to confirm.
        if (videoOverridable) {
            setAcceptVideoOpen(true)
            return
        }

        submitRun()
    }

    // Sync dirty flag and save handle up to the parent dialog so it can
    // intercept dialog-close attempts and offer save-or-discard.
    useEffect(() => {
        isDirtyRef.current = isDirty
    }, [isDirty, isDirtyRef])

    useEffect(() => {
        saveRef.current = handleSave
        return () => {
            if (saveRef.current === handleSave) {
                saveRef.current = null
            }
        }
    })

    return (
        <>
            <ImportIssuesBanner
                unresolved={unresolvedImportIssues}
                onSendBack={() => setSendBackOpen(true)}
                isModerator={isModerator}
            />
            <div className="grid md:grid-cols-[576fr_426fr] gap-x-6 gap-y-4">
                <div className="md:sticky md:top-2 md:self-start space-y-3">
                    {embedUrl ? (
                        <AspectRatio
                            ratio={16 / 9}
                            className="overflow-hidden rounded-md border border-border/40 bg-black"
                        >
                            {/* Keyed by URL so React replaces the iframe instead of mutating
                                src; src mutation navigates the frame and pushes a browser
                                history entry for every edit. */}
                            <iframe
                                key={embedUrl}
                                src={embedUrl}
                                title="Run video"
                                className="h-full w-full"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </AspectRatio>
                    ) : (
                        <AspectRatio
                            ratio={16 / 9}
                            className="rounded-md border border-dashed border-border/40 bg-muted/10"
                        >
                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
                                The link provided is not a YouTube URL!
                            </div>
                        </AspectRatio>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <SectionLabel>Run Info</SectionLabel>
                        <ReadOnlyField label="Game" value={run.game.name} />

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Category</p>
                            <Select value={categoryId} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {runtype === "il" && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Level</p>
                                <Select
                                    value={levelId ?? ""}
                                    onValueChange={(v) => setLevelId(v)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select level..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableLevels.map((lvl) => (
                                            <SelectItem key={lvl.id} value={lvl.id}>
                                                {lvl.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <PlatformEmulatedRow
                            platforms={gameDetail.platforms}
                            platformId={platformId}
                            onPlatformChange={setPlatformId}
                            emulated={emulated}
                            onEmulatedChange={setEmulated}
                        />

                        <CategoryVariableGrid
                            variables={applicableVariables}
                            values={variableValues}
                            onChange={handleVariableChange}
                        />
                    </div>

                    <Divider />

                    <div className="space-y-3">
                        <SectionLabel>Timing</SectionLabel>
                        {resolvedRequired.includes("rta") && (
                            <TimeRow
                                label="Real Time (RTA)"
                                fields={rta}
                                onChange={setRta}
                            />
                        )}
                        {resolvedRequired.includes("lrt") && (
                            <TimeRow
                                label="Loads Removed (LRT)"
                                fields={nl}
                                onChange={setNl}
                            />
                        )}
                        {resolvedRequired.includes("igt") && (
                            <TimeRow
                                label="In-Game Time (IGT)"
                                fields={igt}
                                onChange={setIgt}
                            />
                        )}
                    </div>

                    <Divider />

                    <div className="space-y-3">
                        <SectionLabel>Players</SectionLabel>
                        {run.players.length > 0 ? (
                            <div className="space-y-1">
                                {run.players.map((p) => (
                                    <div
                                        key={p.id}
                                        className="rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-sm"
                                    >
                                        {p.name}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">
                                No players listed.
                            </p>
                        )}
                        {isModerator && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => setPlayersOpen(true)}
                            >
                                <Users className="size-3" />
                                Manage Players
                            </Button>
                        )}
                    </div>

                    <Divider />

                    <div className="space-y-3">
                        <SectionLabel>Details</SectionLabel>

                        <div className="space-y-1">
                            <Label className="text-xs">Video URL</Label>
                            <Input
                                value={video}
                                onChange={(e) => setVideo(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                            />
                            <p className="text-[10px] text-muted-foreground">
                                YouTube Links Only
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Archived Video URL</Label>
                            <Input
                                value={archVideo}
                                onChange={(e) => setArchVideo(e.target.value)}
                                placeholder="https://archive.thps.run/..."
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Speedrun.com URL</Label>
                            <Input
                                value={srcUrl}
                                onChange={(e) => setSrcUrl(e.target.value)}
                                placeholder="https://speedrun.com/..."
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs" htmlFor="edit-run-description">
                                Description
                            </Label>
                            <Textarea
                                id="edit-run-description"
                                maxLength={5000}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        {isModerator && (
                            <ModeratorVerdictSection
                                runStatus={runStatus}
                                denyReason={denyReason}
                                reviewNotes={reviewNotes}
                                onRunStatusChange={setRunStatus}
                                onDenyReasonChange={setDenyReason}
                                onReviewNotesChange={setReviewNotes}
                            />
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <AlertBanner variant="error">{error}</AlertBanner>
            )}

            <DialogFooter className="mt-6">
                <Button variant="outline" onClick={onRequestClose}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && (
                        <Loader2 className="size-4 animate-spin mr-1" />
                    )}
                    Save
                </Button>
            </DialogFooter>

            {isModerator && (
                <ChangePlayersDialog
                    run={run}
                    open={playersOpen}
                    onOpenChange={setPlayersOpen}
                />
            )}

            {isModerator && (
                <SendBackDialog
                    open={sendBackOpen}
                    onOpenChange={setSendBackOpen}
                    runId={run.id}
                    defaultNotes={sendBackDefaultNotes}
                    sendBack={sendBack}
                    onSent={onClose}
                />
            )}

            <AcceptVideoDialog
                open={acceptVideoOpen}
                onOpenChange={setAcceptVideoOpen}
                videoUrl={video}
                onConfirm={() => {
                    setAcceptVideoOpen(false)
                    submitRun()
                }}
            />
        </>
    )
}
