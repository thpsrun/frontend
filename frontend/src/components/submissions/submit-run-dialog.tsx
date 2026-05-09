import { useState, useMemo } from "react"
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
import {
    TimeRow, type TimeFields, EMPTY_TIME, assembleTime,
    isValidYouTubeUrl, getTodayString, SectionLabel, Divider,
    ReadOnlyField,
} from "@/components/submissions/run-form-helpers"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useSubmitRun } from "@/hooks/submissions/useSubmitRun"
import { usePlayerSearch } from "@/hooks/players/usePlayerSearch"
import { Loader2, Plus, Trash2 } from "lucide-react"
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

    const buildDefaultVarValues = (
        cat: GameCategory,
    ): Record<string, string> => {
        const result: Record<string, string> = {}
        const vars = cat.variables.filter((v) => !v.archive)
        vars.forEach((variable) => {
            if (variable.values.length > 0) {
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

    // Determine which row is actively searching to call hook unconditionally
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
            setSelectedVarValues(buildDefaultVarValues(newCat))
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
                toast.success(data.message, {
                    description: "View on Speedrun.com",
                    action: {
                        label: "Open",
                        onClick: () => window.open(data.src_url, "_blank"),
                    },
                })
            },
            onError: (err) => setError(err.message),
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-3xl uppercase tracking-tight leading-none">
                        Submit Run
                    </DialogTitle>
                    <DialogDescription className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium">
                        {gameDetail.name}
                        {activeLevel ? ` · ${activeLevel.name}` : ""}
                        {` · ${selectedCategory.name}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md px-4 py-3 text-sm">
                    Most run settings cannot be modified after submission. Changes must
                    be made directly on Speedrun.com.
                </div>

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
                    <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Platform
                            </p>
                            <Select
                                value={selectedPlatformId}
                                onValueChange={setSelectedPlatformId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select platform..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {gameDetail.platforms.map((platform) => (
                                        <SelectItem
                                            key={platform.id}
                                            value={platform.id}
                                        >
                                            {platform.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <label className="flex items-center gap-2 h-9 shrink-0 cursor-pointer">
                            <Checkbox
                                checked={emulated}
                                onCheckedChange={(v) => setEmulated(v === true)}
                            />
                            <span className="text-sm">Emulated?</span>
                        </label>
                    </div>
                    {activeLevel && (
                        <ReadOnlyField
                            label="Level"
                            value={activeLevel.name}
                        />
                    )}
                    {applicableVariables.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            {applicableVariables.map((variable) => (
                                <div
                                    key={variable.id}
                                    className="space-y-1"
                                >
                                    <p className="text-xs text-muted-foreground">
                                        {variable.name}
                                    </p>
                                    <Select
                                        value={
                                            selectedVarValues[variable.id]
                                            ?? ""
                                        }
                                        onValueChange={(val) =>
                                            handleVarValueChange(
                                                variable.id,
                                                val,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="min-w-35 w-fit">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {variable.values
                                                .filter((v) => !v.archive)
                                                .map((val) => (
                                                    <SelectItem
                                                        key={val.value}
                                                        value={val.value}
                                                    >
                                                        {val.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    )}
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
                                    size="icon"
                                    variant="ghost"
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

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitRun.isPending}
                    >
                        {submitRun.isPending && (
                            <Loader2 className="size-4 animate-spin mr-1" />
                        )}
                        Submit Run
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
