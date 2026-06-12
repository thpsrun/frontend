import { useEffect, useRef, useState } from "react"
import { Link, Navigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "@/hooks/auth/useSession"
import { useRequestPasswordReset } from "@/hooks/auth/useRequestPasswordReset"
import {
    forgotPasswordSchema,
    type ForgotPasswordForm,
} from "@/lib/schemas"
import { ApiError } from "@/lib/api-client"
import {
    passwordResetRequestErrorMessage,
    turnstileErrorMessage,
} from "@/lib/auth-errors"
import { isTurnstileEnabled } from "@/lib/turnstile"
import {
    TurnstileWidget,
    type TurnstileWidgetHandle,
} from "@/components/auth/turnstile-widget"
import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/profile/form-field"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const SUCCESS_COPY = "If an account exists for that email, a reset link is on "
    + "its way. Check your inbox (and spam folder)."

function formatCooldown(seconds: number): string {
    const minutes = Math.max(1, Math.ceil(seconds / 60))
    const unit = minutes === 1 ? "minute" : "minutes"
    return `Too many reset attempts. Try again in ${minutes} ${unit}.`
}

export function ForgotPasswordPage() {
    useDocumentTitle("Reset Password")
    const { isAuthenticated } = useSession()
    const requestReset = useRequestPasswordReset()

    const form = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    })

    const [error, setError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [cooldownSec, setCooldownSec] = useState(0)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const turnstileRef = useRef<TurnstileWidgetHandle>(null)

    // A blank site key disables Turnstile entirely (local dev); otherwise submitting is
    // blocked until the widget hands us a token.
    const turnstileEnabled = isTurnstileEnabled()
    const turnstileReady = !turnstileEnabled || turnstileToken !== null

    // Tick the rate-limit cooldown (seeded from the backend's Retry-After) down once per
    // second so the banner copy updates and the submit button re-enables on its own.
    useEffect(() => {
        if (cooldownSec <= 0) return
        const id = window.setInterval(() => {
            setCooldownSec((s) => (s <= 1 ? 0 : s - 1))
        }, 1000)
        return () => window.clearInterval(id)
    }, [cooldownSec])

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    const resetTurnstile = () => {
        turnstileRef.current?.reset()
        setTurnstileToken(null)
    }

    const onSubmit = form.handleSubmit(async ({ email }) => {
        setError(null)
        try {
            await requestReset.mutateAsync({ email, turnstileToken })
            setSubmitted(true)
        } catch (err) {
            if (err instanceof ApiError) {
                const tsMsg = turnstileErrorMessage(err.code)
                if (tsMsg) {
                    setError(tsMsg)
                    return
                }
                if (err.isRateLimited) {
                    const seconds = err.retryAfter ?? 60
                    setCooldownSec(seconds)
                    setError(passwordResetRequestErrorMessage(err.code, seconds))
                    return
                }
            }
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again...",
            )
        } finally {
            // Turnstile tokens are single-use; always force a fresh challenge so a retry
            // doesn't submit an already-consumed token.
            resetTurnstile()
        }
    })

    const cooldownActive = cooldownSec > 0
    const fieldErrors = form.formState.errors

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-100">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Reset Password
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {error && !cooldownActive && (
                        <AlertBanner variant="error">
                            {error}
                        </AlertBanner>
                    )}
                    {cooldownActive && (
                        <AlertBanner variant="error">
                            {formatCooldown(cooldownSec)}
                        </AlertBanner>
                    )}

                    {submitted ? (
                        <div className="flex flex-col gap-4">
                            <AlertBanner variant="success">
                                {SUCCESS_COPY}
                            </AlertBanner>
                            <Link
                                to="/login"
                                className="text-center text-sm text-foreground underline underline-offset-4 hover:text-primary"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Enter the email address tied to your account
                                and we will send you a reset link.
                            </p>
                            <FormField
                                label="Email"
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                required
                                error={fieldErrors.email?.message}
                                {...form.register("email")}
                            />
                            <TurnstileWidget
                                ref={turnstileRef}
                                onToken={setTurnstileToken}
                                className="flex justify-center"
                            />
                            <Button
                                type="submit"
                                disabled={
                                    requestReset.isPending
                                    || !turnstileReady
                                    || cooldownActive
                                }
                            >
                                {requestReset.isPending
                                    ? "Sending..."
                                    : "Send Reset Link"}
                            </Button>
                            <p className="text-center text-sm text-muted-foreground">
                                Remembered it?{" "}
                                <Link
                                    to="/login"
                                    className="text-foreground underline underline-offset-4 hover:text-primary"
                                >
                                    Back to Login
                                </Link>
                            </p>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
