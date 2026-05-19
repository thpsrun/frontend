import { useState } from "react"
import type { SyntheticEvent } from "react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api-client"
import {
    mapDeletePasswordError,
    mapReauthError,
} from "@/lib/auth-errors"
import { useDeletePassword } from "@/hooks/auth/useDeletePassword"
import { reauthenticateFn } from "@/hooks/auth/auth-api"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/profile/form-field"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type Step = "confirm" | "reauth"

function formatRetryAfter(seconds: number): string {
    if (seconds <= 1) return "a moment"
    if (seconds < 60) return `${seconds} seconds`
    const mins = Math.ceil(seconds / 60)
    return mins === 1 ? "a minute" : `${mins} minutes`
}

export function RemovePasswordDialog({ open, onOpenChange }: Props) {
    const remove = useDeletePassword()

    const [step, setStep] = useState<Step>("confirm")
    const [reauthPassword, setReauthPassword] = useState("")
    const [reauthing, setReauthing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const reset = () => {
        setStep("confirm")
        setReauthPassword("")
        setReauthing(false)
        setError(null)
    }

    const handleOpenChange = (next: boolean) => {
        if (!next) reset()
        onOpenChange(next)
    }

    const attemptDelete = () => {
        setError(null)
        remove.mutate(undefined, {
            onSuccess: () => {
                toast.success(
                    "Password removed. You'll sign in with OAuth or passkey next time.",
                )
                handleOpenChange(false)
            },
            onError: (err) => {
                if (
                    err instanceof ApiError
                    && err.status === 401
                    && err.code === "reauth_required"
                ) {
                    setStep("reauth")
                    return
                }
                if (err instanceof ApiError && err.status === 429) {
                    const retry = err.retryAfter ?? 0
                    setError(
                        `Too many attempts. Try again in ${formatRetryAfter(retry)}.`,
                    )
                    return
                }
                const code = err instanceof ApiError ? err.code : null
                setError(mapDeletePasswordError(code))
            },
        })
    }

    const handleConfirm = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        attemptDelete()
    }

    const handleReauth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!reauthPassword) return
        setError(null)
        setReauthing(true)
        try {
            await reauthenticateFn(reauthPassword)
            setReauthing(false)
            setReauthPassword("")
            setStep("confirm")
            attemptDelete()
        } catch (err) {
            setReauthing(false)
            const code = err instanceof ApiError ? err.code : null
            setError(mapReauthError(code))
        }
    }

    const isReauthStep = step === "reauth"
    const submitting = remove.isPending || reauthing

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <form
                    onSubmit={isReauthStep ? handleReauth : handleConfirm}
                    className="flex flex-col gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>
                            {isReauthStep ? "Verify it's you" : "Remove password"}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {isReauthStep
                            ? "It's been a while since you signed in. Enter your password to continue."
                            : "After you remove your password, you'll only be able to sign in with OAuth or a passkey."}
                    </p>
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    {isReauthStep && (
                        <FormField
                            label="Current password"
                            id="reauth-password"
                            type="password"
                            autoComplete="current-password"
                            value={reauthPassword}
                            onChange={(e) => setReauthPassword(e.target.value)}
                            required
                        />
                    )}
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
                            variant="destructive"
                            disabled={
                                submitting
                                || (isReauthStep && !reauthPassword)
                            }
                        >
                            {isReauthStep
                                ? (reauthing ? "Verifying..." : "Verify and remove")
                                : (remove.isPending ? "Removing..." : "Remove password")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
