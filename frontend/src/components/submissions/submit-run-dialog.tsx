import { useState, useMemo, useEffect } from "react"
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
import {
    TimeRow, type TimeFields, EMPTY_TIME, assembleTime,
    isValidYouTubeUrl, getTodayString, SectionLabel, Divider,
    ReadOnlyField, CategoryVariableGrid, PlatformEmulatedRow,
    buildDefaultVariables,
} from "@/components/submissions/run-form-helpers"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useSubmitRun } from "@/hooks/submissions/useSubmitRun"
import { usePlayerSearch } from "@/hooks/players/usePlayerSearch"
import { Loader2, Plus, Trash2, BookOpen } from "lucide-react"
import { RulesPanel } from "@/components/rules/rules-panel"
import { RulesDialog } from "@/components/rules/rules-dialog"
import { cn } from "@/lib/utils"
import {
    buildActiveSelection,
    buildRulesSections,
} from "@/lib/rules"
import type {
    GameDetail, GameCategory, GameLevel,
} from "@/types/api"
import type { SubmitRunPayload } from "@/types/submissions"

interface SubmitRunDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    gameDetail: GameDetail
    activeCategory: GameCategory
    valueSlugs: string[]
    activeLevel?: GameLevel | null
}

interface PlayerRow {
    rel: "user" | "guest"
    id: string | null
    displayName: string
    searchQuery: string
}


export function SubmitRunDialog({
    open,
    onOpenChange,
    gameDetail,
    activeCategory,
    valueSlugs,
    activeLevel,
}: SubmitRunDialogProps) {
    const { player } = useCurrentPlayer()
    const submitRun = useSubmitRun()

    const makeInitialPlayers = (): PlayerRow[] => {
        if (player) {
            return [{
                rel: "user",
                id: player.player_id,
                displayName: player.player.name,
                searchQuery: "",
            }]
        }
        return [{ rel: "user", id: null, displayName: "", searchQuery: "" }]
    }

    const availableCategories = useMemo(
        () => gameDetail.categories.filter(
            (c) => c.type === activeCategory.type && !c.archive,
        ),
        [gameDetail.categories, activeCategory.type],
    )

    // Builds the initial values based on what is in the URL slugs.
    const buildInitialVarValues = (
        cat: GameCategory,
        slugs: string[],
    ): Record<string, string> => {
        const result: Record<string, string> = {}
        const vars = cat.variables.filter((v) => !v.archive)
        vars.forEach((variable, i) => {
            const slug = slugs[i]
            const matchedValue = variable.values.find(
                (val) => val.slug === slug,
            )
            if (matchedValue) {
                result[variable.id] = matchedValue.value
            } else if (variable.values.length > 0) {
                result[variable.id] = variable.values[0].value
            }
        })
        return result
    }

    const [selectedCategoryId, setSelectedCategoryId] = useState(
        activeCategory.id,
    )
    const [selectedVarValues, setSelectedVarValues] = useState<
        Record<string, string>
    >(() => buildInitialVarValues(activeCategory, valueSlugs))

    const [selectedPlatformId, setSelectedPlatformId] = useState("")
    const [emulated, setEmulated] = useState(false)
    const [players, setPlayers] = useState<PlayerRow[]>(makeInitialPlayers)
    const [rtaTime, setRtaTime] = useState<TimeFields>(EMPTY_TIME)
    const [nlTime, setNlTime] = useState<TimeFields>(EMPTY_TIME)
    const [igtTime, setIgtTime] = useState<TimeFields>(EMPTY_TIME)
    const [video, setVideo] = useState("")
    const [date, setDate] = useState(getTodayString())
    const [comment, setComment] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [activeSearchIdx, setActiveSearchIdx] = useState<number | null>(null)

    // Resolve selected category object
    const selectedCategory = useMemo(
        () => availableCategories.find((c) => c.id === selectedCategoryId)
            ?? activeCategory,
        [availableCategories, selectedCategoryId, activeCategory],
    )

    // Applicable variables for the selected category
    const applicableVariables = useMemo(
        () => selectedCategory.variables.filter((v) => !v.archive),
        [selectedCategory],
    )

    const [rulesOpen, setRulesOpen] = useState(false)
    const [isWide, setIsWide] = useState(
        typeof window !== "undefined"
            ? window.matchMedia("(min-width: 768px)").matches
            : true,
    )

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)")
        const onChange = (e: MediaQueryListEvent) => setIsWide(e.matches)
        mq.addEventListener("change", onChange)
        return () => mq.removeEventListener("change", onChange)
    }, [])

    const orderedValueSlugs = useMemo(
        () => applicableVariables.map((variable) => {
            const valueId = selectedVarValues[variable.id]
            const match = variable.values.find(
                (val) => val.value === valueId,
            )
            return match?.slug ?? ""
        }),
        [applicableVariables, selectedVarValues],
    )

    const activeSelectionForRules = useMemo(
        () => buildActiveSelection(
            selectedCategory,
            activeLevel ?? undefined,
            orderedValueSlugs,
        ),
        [selectedCategory, activeLevel, orderedValueSlugs],
    )

    const rulesView = useMemo(
        () => buildRulesSections(gameDetail, activeSelectionForRules),
        [gameDetail, activeSelectionForRules],
    )

    const activeSearchQuery = activeSearchIdx !== null
        ? (players[activeSearchIdx]?.searchQuery ?? "")
        : ""
    const searchResults = usePlayerSearch(activeSearchQuery)

    const handleCategoryChange = (newCategoryId: string) => {
        setSelectedCategoryId(newCategoryId)
        const newCat = availableCategories.find(
            (c) => c.id === newCategoryId,
        )
        if (newCat) {
            setSelectedVarValues(buildDefaultVariables(newCat))
            // Reset players if new category has fewer max players
            setPlayers((prev) =>
                prev.slice(0, newCat.players),
            )
        }
    }

    const handleVarValueChange = (
        variableId: string,
        valueId: string,
    ) => {
        setSelectedVarValues((prev) => ({
            ...prev,
            [variableId]: valueId,
        }))
    }

    const handleOpenChange = (next: boolean) => {
        if (next) {
            setSelectedCategoryId(activeCategory.id)
            setSelectedVarValues(
                buildInitialVarValues(activeCategory, valueSlugs),
            )
            setSelectedPlatformId("")
            setEmulated(false)
            setPlayers(makeInitialPlayers())
            setRtaTime(EMPTY_TIME)
            setNlTime(EMPTY_TIME)
            setIgtTime(EMPTY_TIME)
            setVideo("")
            setDate(getTodayString())
            setComment("")
            setError(null)
            setActiveSearchIdx(null)
        } else {
            setRulesOpen(false)
        }
        onOpenChange(next)
    }

    const updatePlayerField = (
        idx: number,
        patch: Partial<PlayerRow>,
    ) => {
        setPlayers((prev) =>
            prev.map((r, i) => i === idx ? { ...r, ...patch } : r),
        )
    }

    const addPlayer = () => {
        setPlayers((prev) => [
            ...prev,
            { rel: "user", id: null, displayName: "", searchQuery: "" },
        ])
    }

    const removePlayer = (idx: number) => {
        setPlayers((prev) => prev.filter((_, i) => i !== idx))
        if (activeSearchIdx === idx) setActiveSearchIdx(null)
    }

    const handleSubmit = () => {
        setError(null)

        if (!selectedPlatformId) {
            setError("Please select a platform.")
            return
        }

        if (!isValidYouTubeUrl(video)) {
            setError("Please enter a valid YouTube URL.")
            return
        }

        for (const p of players) {
            if (p.rel === "user" && !p.id) {
                setError("Please select a valid user for all player slots.")
                return
            }
            if (p.rel === "guest" && !p.displayName.trim()) {
                setError("Please enter a name for all guest players.")
                return
            }
        }

        const payload: SubmitRunPayload = {
            game_id: gameDetail.id,
            category_id: selectedCategory.id,
            level_id: activeLevel?.id ?? null,
            platform_id: selectedPlatformId,
            emulated,
            players: players.map((p) => ({
                rel: p.rel,
                id: p.rel === "user" ? p.id : null,
                name: p.rel === "guest" ? p.displayName : null,
            })),
            time: assembleTime(rtaTime),
            timenl: assembleTime(nlTime),
            timeigt: assembleTime(igtTime),
            video,
            comment: comment.trim() || null,
            date: date || null,
            variable_values: Object.keys(selectedVarValues).length > 0
                ? selectedVarValues
                : null,
        }

        submitRun.mutate(payload, {
            onSuccess: (data) => {
                onOpenChange(false)
                toast.success("Run submitted.", {
                    description: data.message,
                    action: {
                        label: "View on SRC",
                        onClick: () => window.open(data.src_url, "_blank"),
                    },
                })
            },
            onError: (err) => {
                setError(err.message)
                toast.error(err.message)
            },
        })
    }

    return (
        <>
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn(
                    "max-h-[85vh]",
                    rulesOpen && isWide
                        ? "max-w-300 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:gap-6 overflow-hidden"
                        : "max-w-lg overflow-y-auto",
                )}
            >
                <div className={cn(
                    rulesOpen && isWide
                        ? "min-w-0 overflow-y-auto"
                        : undefined,
                )}>
                <DialogHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                            <DialogTitle className="font-display text-3xl uppercase tracking-tight leading-none">
                                Submit Run
                            </DialogTitle>
                            <DialogDescription className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium">
                                {gameDetail.name}
                                {activeLevel ? ` · ${activeLevel.name}` : ""}
                                {` · ${selectedCategory.name}`}
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

                <div className="space-y-3">
                    <SectionLabel>Run Info</SectionLabel>
                    <div className="grid grid-cols-2 gap-3">
                        <ReadOnlyField label="Game" value={gameDetail.name} />
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Category
                            </p>
                            <Select
                                value={selectedCategoryId}
                                onValueChange={handleCategoryChange}
                            >
                                <SelectTrigger className="min-w-35 w-fit">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCategories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <PlatformEmulatedRow
                        platforms={gameDetail.platforms}
                        platformId={selectedPlatformId}
                        onPlatformChange={setSelectedPlatformId}
                        emulated={emulated}
                        onEmulatedChange={setEmulated}
                    />
                    {activeLevel && (
                        <ReadOnlyField
                            label="Level"
                            value={activeLevel.name}
                        />
                    )}
                    <CategoryVariableGrid
                        variables={applicableVariables}
                        values={selectedVarValues}
                        onChange={handleVarValueChange}
                    />
                </div>

                <Divider />

                <div className="space-y-3">
                    <SectionLabel>
                        Players (max {selectedCategory.players})
                    </SectionLabel>

                    {players.map((row, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex items-end gap-2">
                                <div className="w-24 shrink-0">
                                    <Label className="text-xs">Type</Label>
                                    <Select
                                        value={row.rel}
                                        onValueChange={(v) => {
                                            updatePlayerField(idx, {
                                                rel: v as "user" | "guest",
                                                id: null,
                                                displayName: "",
                                                searchQuery: "",
                                            })
                                            if (activeSearchIdx === idx) {
                                                setActiveSearchIdx(null)
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">
                                                User
                                            </SelectItem>
                                            <SelectItem value="guest">
                                                Guest
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 relative">
                                    <Label className="text-xs">
                                        {row.rel === "user"
                                            ? "Player Name"
                                            : "Guest Name"}
                                    </Label>
                                    {row.rel === "user" ? (
                                        <Input
                                            value={
                                                row.searchQuery !== ""
                                                    ? row.searchQuery
                                                    : row.displayName
                                            }
                                            onChange={(e) => {
                                                updatePlayerField(idx, {
                                                    searchQuery: e.target.value,
                                                    id: null,
                                                    displayName: "",
                                                })
                                                setActiveSearchIdx(idx)
                                            }}
                                            onFocus={() => {
                                                if (row.searchQuery !== "" || !row.id) {
                                                    setActiveSearchIdx(idx)
                                                }
                                            }}
                                            placeholder="Search players..."
                                        />
                                    ) : (
                                        <Input
                                            value={row.displayName}
                                            onChange={(e) =>
                                                updatePlayerField(idx, {
                                                    displayName: e.target.value,
                                                })
                                            }
                                            placeholder="Guest name"
                                        />
                                    )}

                                    {row.rel === "user" &&
                                        activeSearchIdx === idx &&
                                        searchResults.data &&
                                        searchResults.data.length > 0 && (
                                            <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border border-border bg-popover shadow-md overflow-hidden">
                                                {searchResults.data.map((result) => (
                                                    <button
                                                        key={result.id}
                                                        type="button"
                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault()
                                                            updatePlayerField(idx, {
                                                                id: result.id,
                                                                displayName: result.name,
                                                                searchQuery: "",
                                                            })
                                                            setActiveSearchIdx(null)
                                                        }}
                                                    >
                                                        <span className="font-medium">
                                                            {result.name}
                                                        </span>
                                                        {result.nickname && (
                                                            <span className="text-muted-foreground ml-1">
                                                                ({result.nickname})
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                </div>

                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Remove player"
                                    className="shrink-0"
                                    onClick={() => removePlayer(idx)}
                                    disabled={players.length <= 1}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {players.length < selectedCategory.players && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={addPlayer}
                        >
                            <Plus className="size-3" />
                            Add Player
                        </Button>
                    )}
                </div>

                <Divider />

                <div className="space-y-3">
                    <SectionLabel>Timing</SectionLabel>
                    <TimeRow
                        label="Real Time (RTA)"
                        fields={rtaTime}
                        onChange={setRtaTime}
                    />
                    <TimeRow
                        label="Loads Removed (LRT)"
                        fields={nlTime}
                        onChange={setNlTime}
                    />
                    <TimeRow
                        label="In-Game Time (IGT)"
                        fields={igtTime}
                        onChange={setIgtTime}
                    />
                </div>

                <Divider />

                <div className="space-y-3">
                    <SectionLabel>Details</SectionLabel>

                    <div className="space-y-1">
                        <Label className="text-xs">
                            Video URL <span className="text-destructive">*</span>
                        </Label>
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
                        <Label className="text-xs">Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs" htmlFor="run-comment">
                            Comment <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                            id="run-comment"
                            maxLength={2000}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Any notes about the run..."
                        />
                    </div>
                </div>

                {error && (
                    <AlertBanner variant="error">{error}</AlertBanner>
                )}

                <DialogFooter className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            submitRun.isPending
                            || !selectedPlatformId
                            || !video.trim()
                            || players.some((p) =>
                                p.rel === "user"
                                    ? !p.id
                                    : !p.displayName.trim()
                            )
                        }
                    >
                        {submitRun.isPending && (
                            <Loader2 className="size-4 animate-spin mr-1" />
                        )}
                        Submit Run
                    </Button>
                </DialogFooter>
                </div>

                {rulesOpen && isWide && (
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
        </>
    )
}
