import { useEffect, useState } from "react"
import type { SyntheticEvent } from "react"
import { ApiError } from "@/lib/api-client"
import { mapReauthError, oauthReauthErrorMessage } from "@/lib/auth-errors"
import { runOAuthReauth } from "@/lib/oauth-reauth"
import { reauthenticateFn } from "@/hooks/auth/auth-api"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import { useEnrollPasskey } from "@/hooks/auth/useEnrollPasskey"
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

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type Step = "confirm" | "reauth_password" | "reauth_oauth"

const PROVIDER_LABEL: Record<AuthProvider, string> = {
    discord: "Discord",
    twitch: "Twitch",
}

export function EnrollPasskeyDialog({ open, onOpenChange }: Props) {
    const enroll = useEnrollPasskey()
    const { data: methods } = useAuthMethods()
    const hasUsablePassword = methods?.has_usable_password ?? true
    const firstSocial = methods?.social_accounts[0] ?? null

    const [step, setStep] = useState<Step>("confirm")
    const [name, setName] = useState("")
    const [reauthPassword, setReauthPassword] = useState("")
    const [reauthing, setReauthing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) return
        setStep("confirm")
        setName("")
        setReauthPassword("")
        setReauthing(false)
        setError(null)
    }, [open])

    const close = () => onOpenChange(false)

    const attemptEnroll = (trimmedName: string) => {
        if (!trimmedName) return
        setError(null)
        enroll.mutate(trimmedName, {
            onSuccess: () => close(),
            onError: (err) => {
                // User dismissed the browser webauthn prompt; let them retry.
                if (err instanceof Error && err.name === "NotAllowedError") {
                    return
                }
                if (err instanceof ApiError && err.status === 401) {
                    setStep(
                        hasUsablePassword
                            ? "reauth_password"
                            : "reauth_oauth",
                    )
                    return
                }
                const msg = err instanceof ApiError
                    ? err.message
                    : "Couldn't add Passkey. Please try again..."
                setError(msg)
            },
        })
    }

    const handleConfirm = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) return
        attemptEnroll(trimmed)
    }

    const handlePasswordReauth = async (
        e: SyntheticEvent<HTMLFormElement>,
    ) => {
        e.preventDefault()
        if (!reauthPassword) return
        setError(null)
        setReauthing(true)
        try {
            await reauthenticateFn(reauthPassword)
            setReauthing(false)
            setReauthPassword("")
            setStep("confirm")
            attemptEnroll(name.trim())
        } catch (err) {
            setReauthing(false)
            const code = err instanceof ApiError ? err.code : null
            setError(mapReauthError(code))
        }
    }

    const handleOAuthReauth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!firstSocial) return
        setError(null)
        setReauthing(true)
        const result = await runOAuthReauth(firstSocial.provider)
        setReauthing(false)
        if (result.ok) {
            setStep("confirm")
            attemptEnroll(name.trim())
            return
        }
        setError(
            oauthReauthErrorMessage(
                result.reason,
                PROVIDER_LABEL[firstSocial.provider],
            ),
        )
    }

    const isPasswordReauthStep = step === "reauth_password"
    const isOAuthReauthStep = step === "reauth_oauth"
    const isReauthStep = isPasswordReauthStep || isOAuthReauthStep
    const noOAuthAvailable = isOAuthReauthStep && !firstSocial
    const submitting = enroll.isPending || reauthing
    const providerLabel = firstSocial
        ? PROVIDER_LABEL[firstSocial.provider]
        : ""

    const onSubmit = isOAuthReauthStep
        ? handleOAuthReauth
        : isPasswordReauthStep
            ? handlePasswordReauth
            : handleConfirm

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>
                            {isReauthStep ? "Verify Yourself" : "Add a Passkey"}
                        </DialogTitle>
                    </DialogHeader>
                    {noOAuthAvailable ? (
                        <p className="text-sm text-muted-foreground">
                            You need a password or a linked account to verify
                            yourself before adding a Passkey. Add one in the
                            other settings sections first.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {isPasswordReauthStep && "Enter your password to continue."}
                            {isOAuthReauthStep && `Verify with ${providerLabel} to continue.`}
                            {!isReauthStep && (
                                <>
                                    Give this Passkey a label so you can identify
                                    it later (for example, "Bitwarden" or "YubiKey").
                                </>
                            )}
                        </p>
                    )}
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    {!isReauthStep && (
                        <FormField
                            label="Label"
                            id="passkey-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Passkey Name"
                            required
                        />
                    )}
                    {isPasswordReauthStep && (
                        <FormField
                            label="Current Password"
                            id="passkey-reauth-password"
                            type="password"
                            autoComplete="current-password"
                            value={reauthPassword}
                            onChange={(e) => setReauthPassword(e.target.value)}
                            required
                        />
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close}>
                            Cancel
                        </Button>
                        {!noOAuthAvailable && (
                            <Button
                                type="submit"
                                disabled={
                                    submitting
                                    || (!isReauthStep && !name.trim())
                                    || (isPasswordReauthStep && !reauthPassword)
                                }
                            >
                                {isOAuthReauthStep
                                    ? (reauthing
                                        ? "Verifying..."
                                        : `Verify with ${providerLabel}`)
                                    : isPasswordReauthStep
                                        ? (reauthing ? "Verifying..." : "Verify")
                                        : (submitting
                                            ? "Waiting for passkey..."
                                            : "Continue")}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
