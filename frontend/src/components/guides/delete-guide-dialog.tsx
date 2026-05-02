import { useState } from "react"
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
import { ApiError } from "@/lib/api-client"

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    guideTitle: string
    onConfirm: () => Promise<void>
    isPending: boolean
}

export function DeleteGuideDialog({
    open,
    onOpenChange,
    guideTitle,
    onConfirm,
    isPending,
}: Props) {
    const [phrase, setPhrase] = useState("")
    const [error, setError] = useState<string | null>(null)
    const matches = phrase.trim() === guideTitle.trim()

    async function handleConfirm() {
        setError(null)
        try {
            await onConfirm()
            setPhrase("")
            onOpenChange(false)
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : "Delete failed."
            setError(msg)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v) }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete guide</DialogTitle>
                    <DialogDescription>
                        This permanently deletes the guide. To confirm, type the
                        guide's title below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <Label htmlFor="delete-confirm-input">
                        Type <strong>{guideTitle}</strong> to confirm
                    </Label>
                    <Input
                        id="delete-confirm-input"
                        value={phrase}
                        onChange={(e) => setPhrase(e.target.value)}
                        autoComplete="off"
                    />
                    {error && <AlertBanner variant="error">{error}</AlertBanner>}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!matches || isPending}
                    >
                        {isPending ? "Deleting..." : "Delete guide"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
