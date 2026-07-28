import { useState } from "react"
import type { SyntheticEvent } from "react"
import { toast } from "sonner"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AlertBanner } from "@/components/common/alert-banner"
import { useSubmissions } from "@/hooks/submissions/useSubmissions"
import { usePlayerSearch } from "@/hooks/players/usePlayerSearch"
import { PlayerSearchDropdown } from "@/components/submissions/player-search-dropdown"
import { Loader2, Plus, Trash2 } from "lucide-react"
import type {
    PendingRun, ChangePlayerEntry,
} from "@/types/submissions"

interface PlayerRow {
    id: number
    rel: "user" | "guest"
    value: string
}

// Stable per-row ids so React state (focus, search dropdown) stays attached to
// the right row when a middle row is removed. Uniqueness within one list is
// all that matters, so a module counter is enough.
let nextRowId = 0
const makeRow = (
    rel: "user" | "guest",
    value: string,
): PlayerRow => ({ id: nextRowId++, rel, value })

export function ChangePlayersDialog({
    run,
    open,
    onOpenChange,
}: {
    run: PendingRun
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { changePlayers } = useSubmissions()

    const initialRows: PlayerRow[] = run.players.map(
        (p) => makeRow("user", p.name),
    )

    const [rows, setRows] = useState<PlayerRow[]>(initialRows)
    const [error, setError] = useState<string | null>(null)
    const [activeSearchId, setActiveSearchId] = useState<number | null>(null)

    // One search hook serves every row: only the row currently being typed in (activeSearchId)
    // feeds it, and an empty query keeps the underlying query disabled.
    const activeSearchQuery = activeSearchId !== null
        ? (rows.find((r) => r.id === activeSearchId)?.value ?? "")
        : ""
    const searchResults = usePlayerSearch(activeSearchQuery)

    // Re-seed the form on open rather than on close: this component stays mounted between
    // opens, and the run's player list may have changed since the last time.
    const handleOpenChange = (next: boolean) => {
        if (next) {
            setRows(
                run.players.map((p) => makeRow("user", p.name)),
            )
            setError(null)
            setActiveSearchId(null)
        }
        onOpenChange(next)
    }

    const updateRow = (
        id: number,
        field: keyof Omit<PlayerRow, "id">,
        val: string,
    ) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, [field]: val } : r,
            ),
        )
    }

    const addRow = () => {
        setRows((prev) => [
            ...prev,
            makeRow("user", ""),
        ])
    }

    const removeRow = (id: number) => {
        setRows((prev) => prev.filter((r) => r.id !== id))
        if (activeSearchId === id) setActiveSearchId(null)
    }

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        const players: ChangePlayerEntry[] = rows.map((r) => ({
            rel: r.rel,
            name: r.value,
        }))

        changePlayers.mutate(
            { runId: run.id, data: { players } },
            {
                onSuccess: () => {
                    toast.success("Players updated.")
                    handleOpenChange(false)
                },
                onError: (err) => {
                    setError(err.message)
                    toast.error(err.message)
                },
            },
        )
    }

    const isValid = rows.length > 0 &&
        rows.every((r) => r.value.trim() !== "")

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>
                            Change Players
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        {rows.map((row) => (
                            <div
                                key={row.id}
                                className="flex items-end gap-2"
                            >
                                <div className="w-24 shrink-0">
                                    <Label className="text-xs">
                                        Type
                                    </Label>
                                    <Select
                                        value={row.rel}
                                        onValueChange={(v) => {
                                            updateRow(row.id, "rel", v)
                                            if (activeSearchId === row.id) {
                                                setActiveSearchId(null)
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
                                    <Input
                                        value={row.value}
                                        onChange={(e) => {
                                            updateRow(
                                                row.id,
                                                "value",
                                                e.target.value,
                                            )
                                            if (row.rel === "user") {
                                                setActiveSearchId(row.id)
                                            }
                                        }}
                                        onFocus={() => {
                                            if (row.rel === "user") {
                                                setActiveSearchId(row.id)
                                            }
                                        }}
                                        placeholder={
                                            row.rel === "user"
                                                ? "Search players..."
                                                : "e.g. GuestRunner"
                                        }
                                    />

                                    {row.rel === "user"
                                        && activeSearchId === row.id
                                        && searchResults.data
                                        && searchResults.data.length > 0 && (
                                            <PlayerSearchDropdown
                                                results={searchResults.data}
                                                onSelect={(result) => {
                                                    updateRow(row.id, "value", result.name)
                                                    setActiveSearchId(null)
                                                }}
                                            />
                                        )}
                                </div>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Remove player"
                                    onClick={() => removeRow(row.id)}
                                    disabled={rows.length <= 1}
                                    className="shrink-0"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={addRow}
                        >
                            <Plus className="size-3" />
                            Add Player
                        </Button>

                        {error && (
                            <AlertBanner variant="error">
                                {error}
                            </AlertBanner>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                changePlayers.isPending || !isValid
                            }
                        >
                            {changePlayers.isPending && (
                                <Loader2 className={
                                    "size-4 animate-spin mr-1"
                                } />
                            )}
                            Update Players
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
