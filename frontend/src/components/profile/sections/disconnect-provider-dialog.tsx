import { useEffect, useState } from "react"
import type { SyntheticEvent } from "react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api-client"
import {
    mapDisconnectSocialError,
    mapReauthError,
    oauthReauthErrorMessage,
} from "@/lib/auth-errors"
import { runOAuthReauth } from "@/lib/oauth-reauth"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import { useDisconnectSocialAccount } from "@/hooks/auth/useDisconnectSocialAccount"
import { reauthenticateFn } from "@/hooks/auth/auth-api"
import type { AuthProvider } from "@/types/auth"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/profile/form-field"

interface Target {
    providerId: AuthProvider
    label: string
}

interface Props {
    target: Target | null
    onClose: () => void
}

type Step = "confirm" | "reauth_password" | "reauth_oauth"

function formatRetryAfter(seconds: number): string {
    if (seconds <= 1) return "a moment"
    if (seconds < 60) return `${seconds} seconds`
    const mins = Math.ceil(seconds / 60)
    return mins === 1 ? "a minute" : `${mins} minutes`
}

export function DisconnectProviderDialog({ target, onClose }: Props) {
    const disconnect = useDisconnectSocialAccount()
    const { data: methods } = useAuthMethods()
    const hasUsablePassword = methods?.has_usable_password ?? true

    const [step, setStep] = useState<Step>("confirm")
    const [reauthPassword, setReauthPassword] = useState("")
    const [reauthing, setReauthing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setStep("confirm")
        setReauthPassword("")
        setReauthing(false)
        setError(null)
    }, [target])

    const attemptDisconnect = () => {
        if (!target) return
        setError(null)
        disconnect.mutate(target.providerId, {
            onSuccess: () => onClose(),
            onError: (err) => {
                if (
                    err instanceof ApiError
                    && err.isAuthRequired
                    && err.code === "reauth_required"
                ) {
                    setStep(hasUsablePassword ? "reauth_password" : "reauth_oauth")
                    return
                }
                if (err instanceof ApiError && err.isRateLimited) {
                    const retry = err.retryAfter ?? 0
                    setError(
                        `Too many attempts. Try again in ${formatRetryAfter(retry)}.`,
                    )
                    return
                }
                const code = err instanceof ApiError ? err.code : null
                const mapped = mapDisconnectSocialError(code)
                if (mapped.silent) {
                    onClose()
                    return
                }
                if (mapped.toast) {
                    toast.error(mapped.toast)
                }
                setError(mapped.toast ?? "Couldn't disconnect. Please try again...")
            },
        })
    }

    const handleConfirm = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        attemptDisconnect()
    }

    const handleReauth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isPasswordReauthStep) return
        if (!reauthPassword) return
        setError(null)
        setReauthing(true)
        try {
            await reauthenticateFn(reauthPassword)
            setReauthing(false)
            setReauthPassword("")
            setStep("confirm")
            attemptDisconnect()
        } catch (err) {
            setReauthing(false)
            const code = err instanceof ApiError ? err.code : null
            setError(mapReauthError(code))
        }
    }

    const handleOAuthReauth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!target) return
        setError(null)
        setReauthing(true)
        const result = await runOAuthReauth(target.providerId)
        setReauthing(false)
        if (result.ok) {
            setStep("confirm")
            attemptDisconnect()
            return
        }
        setError(oauthReauthErrorMessage(result.reason, target.label))
    }

    const isPasswordReauthStep = step === "reauth_password"
    const isOAuthReauthStep = step === "reauth_oauth"
    const isReauthStep = isPasswordReauthStep || isOAuthReauthStep
    const submitting = disconnect.isPending || reauthing
    const providerLabel = target?.label ?? ""

    return (
        <Dialog
            open={target !== null}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent>
                <form
                    onSubmit={
                        isOAuthReauthStep
                            ? handleOAuthReauth
                            : isPasswordReauthStep
                                ? handleReauth
                                : handleConfirm
                    }
                    className="flex flex-col gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>
                            {isReauthStep
                                ? "Verify Yourself"
                                : `Disconnect ${providerLabel}`}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {isPasswordReauthStep && "Enter your password to continue."}
                        {isOAuthReauthStep && `Verify with ${providerLabel} to continue.`}
                        {!isReauthStep && (
                            <>
                                You won't be able to sign in with{" "}
                                <span className="font-medium">
                                    {providerLabel}
                                </span>{" "}
                                anymore.
                            </>
                        )}
                    </p>
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    {isPasswordReauthStep && (
                        <FormField
                            label="Current Password"
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
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={
                                submitting
                                || (isPasswordReauthStep && !reauthPassword)
                            }
                        >
                            {isOAuthReauthStep
                                ? (reauthing ? "Verifying..." : `Verify with ${providerLabel}`)
                                : isPasswordReauthStep
                                    ? (reauthing ? "Verifying..." : "Verify and Disconnect")
                                    : (disconnect.isPending ? "Disconnecting..." : "Disconnect")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
