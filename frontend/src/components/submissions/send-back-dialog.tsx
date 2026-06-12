import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertBanner } from "@/components/common/alert-banner"
import { ApiError } from "@/lib/api-client"
import { parseValidationErrors } from "@/lib/validation-errors"
import { validateReviewNotes } from "@/lib/validation"
import type { useSendBackForReview } from "@/hooks/submissions/useSendBackForReview"

// The mutation is owned by the parent edit-run dialog (which also uses it for its own save flow
// and busy state), so it is passed in rather than created here.
interface SendBackDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    runId: string
    defaultNotes: string
    sendBack: ReturnType<typeof useSendBackForReview>
    onSent: () => void
}

export function SendBackDialog({
    open, onOpenChange, runId, defaultNotes, sendBack, onSent,
}: SendBackDialogProps) {
    // Ignore close attempts (Escape, overlay clicks) while the request is being completed.
    const handleOpenChange = (next: boolean) => {
        if (sendBack.isPending) return
        onOpenChange(next)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl uppercase tracking-tight">
                        Send Back to Runner
                    </DialogTitle>
                    <DialogDescription>
                        The runner receives these notes and can fix the run and
                        resubmit it. Other edits in the run dialog are not saved.
                    </DialogDescription>
                </DialogHeader>
                <SendBackForm
                    runId={runId}
                    defaultNotes={defaultNotes}
                    sendBack={sendBack}
                    onSent={onSent}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

interface SendBackFormProps {
    runId: string
    defaultNotes: string
    sendBack: ReturnType<typeof useSendBackForReview>
    onSent: () => void
    onCancel: () => void
}

// Separate component so the notes state lives inside DialogContent, which Radix unmounts on
// close; reopening therefore re-seeds the textarea from defaultNotes.
function SendBackForm({
    runId, defaultNotes, sendBack, onSent, onCancel,
}: SendBackFormProps) {
    const [notes, setNotes] = useState(defaultNotes)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = () => {
        const notesError = validateReviewNotes(notes)
        if (notesError) {
            setError(notesError)
            return
        }
        setError(null)
        sendBack.mutate(
            { runId, notes },
            {
                onSuccess: () => {
                    toast.success("Run sent back to runner.")
                    onSent()
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
                    const parsed = parseValidationErrors(err)
                    if (parsed) {
                        const firstField = Object.values(parsed.fieldErrors)[0]
                        setError(
                            parsed.formError
                            ?? firstField
                            ?? "Could not send the run back...",
                        )
                        return
                    }
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Could not send the run back...",
                    )
                },
            },
        )
    }

    return (
        <>
            <div className="space-y-1">
                <Label className="text-xs" htmlFor="send-back-notes">
                    Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="send-back-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What does the runner need to fix?"
                    rows={5}
                    maxLength={2000}
                    autoFocus
                />
                <p className="text-[10px] text-muted-foreground">
                    Minimum 5 characters: {notes.length} / 2000
                </p>
            </div>

            {error && <AlertBanner variant="error">{error}</AlertBanner>}

            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={sendBack.isPending}
                >
                    Cancel
                </Button>
                <Button onClick={handleConfirm} disabled={sendBack.isPending}>
                    {sendBack.isPending && (
                        <Loader2 className="size-4 animate-spin mr-1" />
                    )}
                    Send Back
                </Button>
            </DialogFooter>
        </>
    )
}
