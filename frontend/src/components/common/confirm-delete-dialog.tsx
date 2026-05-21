import { useState, type ReactNode, type SyntheticEvent } from "react"
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
import { AlertBanner } from "@/components/common/alert-banner"
import { getErrorMessage } from "@/lib/utils"

interface ConfirmDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: ReactNode
    confirmPhrase: string
    confirmLabel?: string
    pendingLabel?: string
    inputLabel?: ReactNode
    isPending: boolean
    onConfirm: () => Promise<void>
}

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmPhrase,
    confirmLabel = "Delete",
    pendingLabel = "Deleting...",
    inputLabel,
    isPending,
    onConfirm,
}: ConfirmDeleteDialogProps) {
    const [phrase, setPhrase] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleOpenChange = (next: boolean) => {
        if (isPending) return
        if (next) {
            setPhrase("")
            setError(null)
        }
        onOpenChange(next)
    }

    const matches = phrase.trim() === confirmPhrase.trim()

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!matches || isPending) return
        setError(null)
        try {
            await onConfirm()
            onOpenChange(false)
        } catch (err) {
            setError(getErrorMessage(err, "Deletion Failed..."))
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogContent>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && (
                            <DialogDescription>
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <div className="space-y-3">
                        <Label htmlFor="confirm-delete-input">
                            {inputLabel ?? (
                                <>
                                    Type{" "}
                                    <strong>{confirmPhrase}</strong>
                                    {" "}to confirm
                                </>
                            )}
                        </Label>
                        <Input
                            id="confirm-delete-input"
                            value={phrase}
                            onChange={(e) => setPhrase(e.target.value)}
                            autoComplete="off"
                        />
                        {error && (
                            <AlertBanner variant="error">
                                {error}
                            </AlertBanner>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={!matches || isPending}
                        >
                            {isPending ? pendingLabel : confirmLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
