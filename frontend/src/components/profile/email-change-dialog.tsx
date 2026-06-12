import { useEffect, useState } from "react"
import type { SyntheticEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ApiError } from "@/lib/api-client"
import {
    mapEmailChangeError,
    mapReauthError,
    oauthReauthErrorMessage,
} from "@/lib/auth-errors"
import { formatRetryAfter } from "@/lib/utils"
import { emailChangeSchema, type EmailChangeForm } from "@/lib/schemas"
import { runOAuthReauth } from "@/lib/oauth-reauth"
import { reauthenticateFn } from "@/hooks/auth/auth-api"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import { useRequestEmailChange } from "@/hooks/auth/useRequestEmailChange"
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

type Step = "form" | "reauth_password" | "reauth_oauth"

const PROVIDER_LABEL: Record<AuthProvider, string> = {
    discord: "Discord",
    twitch: "Twitch",
}

// Changing email is a sensitive allauth action: the backend can answer 401 with code
// reauth_required (which api-client deliberately does not treat as "auth lost"). This dialog
// handles that inline, swapping to a password or OAuth verification step and then replaying
// the email change with the address still held in the form.
export function EmailChangeDialog({ open, onOpenChange }: Props) {
    const request = useRequestEmailChange()
    const { data: methods } = useAuthMethods()
    const hasUsablePassword = methods?.has_usable_password ?? false
    const firstSocial = methods?.social_accounts[0] ?? null

    const [step, setStep] = useState<Step>("form")
    const [reauthPassword, setReauthPassword] = useState("")
    const [reauthing, setReauthing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<EmailChangeForm>({
        resolver: zodResolver(emailChangeSchema),
        defaultValues: { newEmail: "" },
    })

    // Reset everything only when the dialog closes; resetting on open would wipe state while
    // the reauth step is mid-flight.
    useEffect(() => {
        if (open) return
        setStep("form")
        setReauthPassword("")
        setReauthing(false)
        setError(null)
        form.reset({ newEmail: "" })
    }, [open, form])

    const close = () => onOpenChange(false)

    const attemptChange = (newEmail: string) => {
        setError(null)
        request.mutate(newEmail, {
            onSuccess: () => {
                toast.success(`We sent a verification email to ${newEmail}.`)
                close()
            },
            onError: (err) => {
                if (
                    err instanceof ApiError
                    && err.isAuthRequired
                    && err.code === "reauth_required"
                ) {
                    // OAuth-only accounts have no password to type, so verify via the first
                    // linked social account instead.
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
                setError(mapEmailChangeError(code))
            },
        })
    }

    const handleFormSubmit = form.handleSubmit((values) => {
        attemptChange(values.newEmail)
    })

    const handlePasswordReauth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!reauthPassword) return
        setError(null)
        setReauthing(true)
        try {
            await reauthenticateFn(reauthPassword)
            setReauthing(false)
            setReauthPassword("")
            setStep("form")
            attemptChange(form.getValues("newEmail"))
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
            setStep("form")
            attemptChange(form.getValues("newEmail"))
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
    const noReauthAvailable = isOAuthReauthStep && !firstSocial
    const submitting = request.isPending || reauthing
    const providerLabel = firstSocial
        ? PROVIDER_LABEL[firstSocial.provider]
        : ""

    const onSubmit = isOAuthReauthStep
        ? handleOAuthReauth
        : isPasswordReauthStep
            ? handlePasswordReauth
            : handleFormSubmit

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>
                            {isReauthStep ? "Verify Yourself" : "Change email"}
                        </DialogTitle>
                    </DialogHeader>
                    {noReauthAvailable ? (
                        <p className="text-sm text-muted-foreground">
                            You need a password or a linked account to verify
                            yourself before changing your email. Add one in the
                            other settings sections first.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {isPasswordReauthStep && "Enter your password to continue."}
                            {isOAuthReauthStep && `Verify with ${providerLabel} to continue.`}
                            {!isReauthStep && (
                                <>
                                    We'll send a verification link to the new address. Your current email won't change until you click it.
                                </>
                            )}
                        </p>
                    )}
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    {!isReauthStep && (
                        <FormField
                            label="New email"
                            id="new-email"
                            type="email"
                            autoComplete="email"
                            error={form.formState.errors.newEmail?.message}
                            {...form.register("newEmail")}
                        />
                    )}
                    {isPasswordReauthStep && (
                        <FormField
                            label="Current Password"
                            id="email-reauth-password"
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
                        {!noReauthAvailable && (
                            <Button
                                type="submit"
                                disabled={
                                    submitting
                                    || (isPasswordReauthStep && !reauthPassword)
                                }
                            >
                                {isOAuthReauthStep
                                    ? (reauthing
                                        ? "Verifying..."
                                        : `Verify with ${providerLabel}`)
                                    : isPasswordReauthStep
                                        ? (reauthing ? "Verifying..." : "Verify and continue")
                                        : (request.isPending ? "Sending..." : "Send verification email")}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
