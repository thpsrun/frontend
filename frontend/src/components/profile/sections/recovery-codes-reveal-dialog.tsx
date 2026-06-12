import { useEffect, useState } from "react"
import { useGenerateRecoveryCodes } from "@/hooks/auth/useRecoveryCodes"
import { useReauthGuard } from "@/hooks/auth/useReauthGuard"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReauthStep } from "@/components/auth/reauth-step"
import { RecoveryCodesDisplay } from "./recovery-codes-display"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function RecoveryCodesRevealDialog({ open, onOpenChange }: Props) {
    const generate = useGenerateRecoveryCodes()
    const { reauthNeeded, error, runGuarded, onReauthed, reset } =
        useReauthGuard()
    const [codes, setCodes] = useState<string[]>([])

    const close = () => onOpenChange(false)

    // Wipe the codes when the dialog closes so reopening never shows a stale, already
    // invalidated set.
    useEffect(() => {
        if (open) return
        setCodes([])
        reset()
    }, [open, reset])

    const handleGenerate = () => {
        void runGuarded(async () => {
            const result = await generate.mutateAsync()
            setCodes(result.unused_codes)
        }, "Couldn't generate recovery codes. Please try again.")
    }

    const hasCodes = codes.length > 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {reauthNeeded ? (
                    <ReauthStep onSuccess={onReauthed} onCancel={close} />
                ) : (
                    <div className="flex flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle>
                                {hasCodes
                                    ? "Save Your Recovery Codes"
                                    : "Regenerate Recovery Codes"}
                            </DialogTitle>
                        </DialogHeader>
                        {error && (
                            <div className="text-sm text-destructive">{error}</div>
                        )}
                        {hasCodes ? (
                            <>
                                <RecoveryCodesDisplay codes={codes} />
                                <DialogFooter>
                                    <Button type="button" onClick={close}>
                                        Done
                                    </Button>
                                </DialogFooter>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    This generates a new set of recovery codes and
                                    invalidates your existing ones. You'll see the
                                    new codes only once - SAVE THEM!
                                </p>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={close}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={generate.isPending}
                                        onClick={handleGenerate}
                                    >
                                        {generate.isPending
                                            ? "Generating..."
                                            : error
                                                ? "Try Again"
                                                : "Generate New Codes"}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
