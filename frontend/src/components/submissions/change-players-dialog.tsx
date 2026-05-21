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
import { Loader2, Plus, Trash2 } from "lucide-react"
import type {
    PendingRun, ChangePlayerEntry,
} from "@/types/submissions"

interface PlayerRow {
    rel: "user" | "guest"
    value: string
}

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

    const initialRows: PlayerRow[] = run.players.map((p) => ({
        rel: "user" as const,
        value: p.name,
    }))

    const [rows, setRows] = useState<PlayerRow[]>(initialRows)
    const [error, setError] = useState<string | null>(null)

    const handleOpenChange = (next: boolean) => {
        if (next) {
            setRows(
                run.players.map((p) => ({
                    rel: "user" as const,
                    value: p.name,
                })),
            )
            setError(null)
        }
        onOpenChange(next)
    }

    const updateRow = (
        idx: number,
        field: keyof PlayerRow,
        val: string,
    ) => {
        setRows((prev) =>
            prev.map((r, i) =>
                i === idx ? { ...r, [field]: val } : r,
            ),
        )
    }

    const addRow = () => {
        setRows((prev) => [
            ...prev,
            { rel: "user", value: "" },
        ])
    }

    const removeRow = (idx: number) => {
        setRows((prev) => prev.filter((_, i) => i !== idx))
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
                        {rows.map((row, idx) => (
                            <div
                                key={idx}
                                className="flex items-end gap-2"
                            >
                                <div className="w-24">
                                    <Label className="text-xs">
                                        Type
                                    </Label>
                                    <Select
                                        value={row.rel}
                                        onValueChange={(v) =>
                                            updateRow(
                                                idx,
                                                "rel",
                                                v,
                                            )
                                        }
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
                                <div className="flex-1">
                                    <Label className="text-xs">
                                        {row.rel === "user"
                                            ? "Player Name"
                                            : "Guest Name"}
                                    </Label>
                                    <Input
                                        value={row.value}
                                        onChange={(e) =>
                                            updateRow(
                                                idx,
                                                "value",
                                                e.target.value,
                                            )
                                        }
                                        placeholder={
                                            row.rel === "user"
                                                ? "e.g. SpeedRunner"
                                                : "e.g. GuestRunner"
                                        }
                                    />
                                </div>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Remove player"
                                    onClick={() => removeRow(idx)}
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
