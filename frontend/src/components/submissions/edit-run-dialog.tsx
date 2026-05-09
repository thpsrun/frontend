import { useMemo, useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Textarea } from "@/components/ui/textarea"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Loader2, Users } from "lucide-react"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useRun } from "@/hooks/runs/useRun"
import { useUpdateRun } from "@/hooks/submissions/useUpdateRun"
import { useSubmissions } from "@/hooks/submissions/useSubmissions"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import {
    TimeRow, type TimeFields,
    assembleTime, parseTimeSecs, isValidYouTubeUrl,
    getYouTubeEmbedUrl,
    SectionLabel, Divider, ReadOnlyField,
    CategoryVariableGrid, PlatformEmulatedRow,
    buildDefaultVariables, timeFieldsToSecs,
} from "@/components/submissions/run-form-helpers"
import {
    ChangePlayersDialog,
} from "@/components/submissions/change-players-dialog"

import type {
    GameDetail, RunDetail,
} from "@/types/api"
import type {
    PendingRun, RunUpdateRequest,
} from "@/types/submissions"

interface EditRunDialogProps {
    run: PendingRun
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditRunDialog({
    run, open, onOpenChange,
}: EditRunDialogProps) {
    const runQuery = useRun(run.id, { enabled: open })
    const gameQuery = useGameDetail(run.game.slug, { enabled: open })
    const updateRun = useUpdateRun()

    const isLoading = runQuery.isLoading || gameQuery.isLoading
    const loadError = runQuery.error ?? gameQuery.error

    const detail = runQuery.data
    const gameDetail = gameQuery.data

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-268.5 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-3xl uppercase tracking-tight leading-none">
                        Edit Run
                    </DialogTitle>
                    <DialogDescription className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium">
                        {run.game.name}
                        {run.level ? ` · ${run.level.name}` : ""}
                        {` · ${run.category.name}`}
                    </DialogDescription>
                </DialogHeader>

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
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

interface EditRunFormProps {
    run: PendingRun
    detail: RunDetail
    gameDetail: GameDetail
    updateRun: ReturnType<typeof useUpdateRun>
    onClose: () => void
}

// Maps the RunDetail runtype ("main" | "il") to GameCategory type ("per-game" | "per-level").
function runtypeToCategoryType(
    runtype: "main" | "il",
): "per-game" | "per-level" {
    return runtype === "main" ? "per-game" : "per-level"
}

function EditRunForm({
    run, detail, gameDetail, updateRun, onClose,
}: EditRunFormProps) {
    const runtype = detail.runtype
    const [categoryId, setCategoryId] = useState<string>(detail.category)
    const [levelId, setLevelId] = useState<string | null>(detail.level)
    const [platformId, setPlatformId] = useState<string>(detail.platform)
    const [emulated, setEmulated] = useState<boolean>(false)
    const [obsolete, setObsolete] = useState<boolean>(detail.obsolete)
    const [place, setPlace] = useState<string>(String(detail.place))
    const [video, setVideo] = useState<string>(detail.video ?? "")
    const [archVideo, setArchVideo] = useState<string>(detail.arch_video ?? "")
    const [srcUrl, setSrcUrl] = useState<string>(detail.url ?? "")
    const [description, setDescription] = useState<string>(
        run.description ?? "",
    )
    const [date, setDate] = useState<string>(
        detail.date ? detail.date.slice(0, 10) : "",
    )

    const initial = useMemo(() => ({
        categoryId: detail.category,
        levelId: detail.level,
        platformId: detail.platform,
        obsolete: detail.obsolete,
        place: String(detail.place),
        video: detail.video ?? "",
        archVideo: detail.arch_video ?? "",
        srcUrl: detail.url ?? "",
        description: run.description ?? "",
        date: detail.date ? detail.date.slice(0, 10) : "",
        variables: JSON.stringify(detail.variables),
    }), [detail, run.description])

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

    const isDirty = (
        categoryId !== initial.categoryId
        || levelId !== initial.levelId
        || platformId !== initial.platformId
        || obsolete !== initial.obsolete
        || place !== initial.place
        || video !== initial.video
        || archVideo !== initial.archVideo
        || srcUrl !== initial.srcUrl
        || description !== initial.description
        || date !== initial.date
        || JSON.stringify(variableValues) !== initial.variables
    )

    const handleCancel = () => {
        if (isDirty) {
            const ok = window.confirm(
                "Discard changes? Any unsaved edits will be lost.",
            )
            if (!ok) return
        }
        onClose()
    }

    const { player } = useCurrentPlayer()
    const { verifyReject } = useSubmissions()
    const isModerator = useMemo(
        () => player?.moderation.moderated_games.some(
            (g) => g.slug === run.game.slug,
        ) ?? false,
        [player, run.game.slug],
    )

    type RunStatusChoice = "unchanged" | "verified" | "rejected"
    const [runStatus, setRunStatus] = useState<RunStatusChoice>("unchanged")
    const [denyReason, setDenyReason] = useState("")

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

    const embedUrl = useMemo(() => getYouTubeEmbedUrl(video), [video])

    const handleCategoryChange = (newId: string) => {
        setCategoryId(newId)
        const next = availableCategories.find((c) => c.id === newId)
        if (next) setVariableValues(buildDefaultVariables(next))
    }

    const handleVariableChange = (variableId: string, value: string) => {
        setVariableValues((prev) => ({ ...prev, [variableId]: value }))
    }

    const handleSave = () => {
        setError(null)

        if (runtype === "il" && !levelId) {
            setError("Select a level for IL runs.")
            return
        }
        if (!platformId) {
            setError("Pick a platform before saving.")
            return
        }
        if (video && !isValidYouTubeUrl(video)) {
            setError("Video URL must be a valid YouTube link.")
            return
        }

        const placeNum = parseInt(place, 10)
        if (!Number.isFinite(placeNum) || placeNum < 1) {
            setError("Place must be 1 or greater.")
            return
        }
        if (
            isModerator
            && runStatus === "rejected"
            && !denyReason.trim()
        ) {
            setError("Provide a reason when denying a run.")
            return
        }

        const rtaStr = assembleTime(rta)
        const nlStr = assembleTime(nl)
        const igtStr = assembleTime(igt)

        const payload: RunUpdateRequest = {
            category_id: categoryId,
            level_id: runtype === "il" ? levelId : null,
            runtype,
            place: placeNum,
            time: rtaStr,
            time_secs: timeFieldsToSecs(rta),
            timenl: nlStr,
            timenl_secs: timeFieldsToSecs(nl),
            timeigt: igtStr,
            timeigt_secs: timeFieldsToSecs(igt),
            video: video.trim() || null,
            arch_video: archVideo.trim() || null,
            obsolete,
            platform_id: platformId,
            description: description.trim() || null,
            emulated,
            date: date || null,
            url: srcUrl.trim() || null,
            variable_values: Object.keys(variableValues).length > 0
                ? variableValues
                : null,
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
                                        ? "Run updated and verified."
                                        : "Run updated and denied.",
                                )
                                onClose()
                            },
                            onError: (err) => setError(err.message),
                        },
                    )
                },
                onError: (err) => setError(err.message),
            },
        )
    }

    return (
        <>
            <div className="grid md:grid-cols-[576fr_426fr] gap-x-6 gap-y-4">
                <div className="md:sticky md:top-2 md:self-start space-y-3">
                    {embedUrl ? (
                        <AspectRatio
                            ratio={16 / 9}
                            className="overflow-hidden rounded-md border border-border/40 bg-black"
                        >
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
                        <TimeRow label="Real Time (RTA)" fields={rta} onChange={setRta} />
                        <TimeRow label="Loads Removed (LRT)" fields={nl} onChange={setNl} />
                        <TimeRow label="In-Game Time (IGT)" fields={igt} onChange={setIgt} />
                    </div>

                    <Divider />

                    <div className="space-y-3">
                        <SectionLabel>Players</SectionLabel>
                        {run.players.length > 0 ? (
                            <div className="space-y-1">
                                {run.players.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-sm"
                                    >
                                        <span>{p.name}</span>
                                        {p.countrycode && (
                                            <span className="text-[10px] uppercase text-muted-foreground tracking-wide">
                                                {p.countrycode}
                                            </span>
                                        )}
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
                                YouTube links only
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

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Place</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={place}
                                    onChange={(e) => setPlace(e.target.value)}
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={obsolete}
                                onCheckedChange={(v) => setObsolete(v === true)}
                            />
                            <span className="text-sm">Obsolete</span>
                        </label>

                        {isModerator && (
                            <div className="space-y-1 pt-2">
                                <Label className="text-xs">Run Status</Label>
                                <Select
                                    value={runStatus}
                                    onValueChange={(v) =>
                                        setRunStatus(v as RunStatusChoice)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unchanged">
                                            Keep unverified
                                        </SelectItem>
                                        <SelectItem value="verified">
                                            Verified
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            Denied
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {runStatus === "rejected" && (
                                    <div className="space-y-1 pt-2">
                                        <Label
                                            className="text-xs"
                                            htmlFor="run-deny-reason"
                                        >
                                            Reason{" "}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="run-deny-reason"
                                            value={denyReason}
                                            onChange={(e) =>
                                                setDenyReason(e.target.value)
                                            }
                                            placeholder="Why is this run being denied?"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <AlertBanner variant="error">{error}</AlertBanner>
            )}

            <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={updateRun.isPending || verifyReject.isPending}
                >
                    {(updateRun.isPending || verifyReject.isPending) && (
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
        </>
    )
}

