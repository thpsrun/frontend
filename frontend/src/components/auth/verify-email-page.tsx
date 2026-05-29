import { useEffect, useRef, useState } from "react"
import type { ReactNode, SyntheticEvent } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api-client"
import {
    mapResendEmailChangeError,
    mapVerifyEmailChangeError,
    mapVerifySignupEmailError,
} from "@/lib/auth-errors"
import { queryKeys } from "@/lib/query-keys"
import {
    clearSignupVerification,
    readSignupVerification,
    updateSignupVerificationEmail,
} from "@/lib/signup-verification-state"
import { formatRetryAfter } from "@/lib/utils"
import { verifyEmailChangeFn, verifySignupEmailFn } from "@/hooks/auth/email-api"
import { useEmailStatus } from "@/hooks/auth/useEmailStatus"
import { useResendEmailChange } from "@/hooks/auth/useResendEmailChange"
import { EmailRecoveryForm } from "@/components/auth/email-recovery-form"
import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const RESEND_COOLDOWN_SECONDS = 60

function CardShell({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-100">
                <CardHeader>
                    <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        </div>
    )
}

export function VerifyEmailPage() {
    const status = useEmailStatus()
    const { key } = useParams<{ key?: string }>()
    const [hasStashedSignup] = useState(() => readSignupVerification() !== null)

    if (status.isLoading) {
        return (
            <CardShell title="Verify your email">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </CardShell>
        )
    }

    // A 401 from /auth/me/email means the user isn't logged in, which is the
    // signup verification flow. Anything else is a logged-in user.
    if (status.error instanceof ApiError && status.error.isAuthRequired) {
        return <SignupVerifyContent />
    }

    if (status.error) {
        return (
            <CardShell title="Verify your email">
                <AlertBanner variant="error">
                    Couldn't load verification status. Try refreshing the page.
                </AlertBanner>
            </CardShell>
        )
    }

    const pendingEmail = status.data?.pending_email ?? null

    if (!pendingEmail && hasStashedSignup) {
        return <SignupVerifyContent />
    }

    // If there's a key to try OR a pending change to display, show the
    // change-verify content. Only fall back to NoPending when there's truly
    // nothing to do - that way a stale link still POSTs and surfaces the 400.
    if (!key && !pendingEmail) {
        return <NoPendingContent />
    }

    return <EmailChangeVerifyContent pendingEmail={pendingEmail} />
}

function SignupVerifyContent() {
    const { key } = useParams<{ key?: string }>()
    const navigate = useNavigate()
    const qc = useQueryClient()

    const [stashed, setStashed] = useState(() => readSignupVerification())
    const [code, setCode] = useState(key ?? "")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)
    const [recoveryOpen, setRecoveryOpen] = useState(false)
    const autoSubmittedRef = useRef(false)

    // Plain fetch + useState rather than useMutation. Auto-firing useMutation
    // from a useEffect interacts badly with StrictMode: the observer's
    // subscription is torn down between the mount and the mutation settling,
    // so the error/success state never reaches the component.
    const runVerify = (submittedCode: string) => {
        setError(null)
        setSubmitting(true)
        verifySignupEmailFn(submittedCode)
            .then(({ loggedIn }) => {
                clearSignupVerification()
                qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.email() })
                if (loggedIn) {
                    toast.success("Email verified. Welcome!")
                    navigate("/")
                } else {
                    toast.success("Email verified. Please log in to continue.")
                    navigate("/login")
                }
            })
            .catch((err) => {
                const apiCode = err instanceof ApiError ? err.code : null
                setError(mapVerifySignupEmailError(apiCode))
                setSubmitting(false)
            })
    }

    useEffect(() => {
        if (autoSubmittedRef.current) return
        if (!key) return
        if (!key.trim()) return
        autoSubmittedRef.current = true
        runVerify(key.trim())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setInfo(null)
        const trimmed = code.trim()
        if (!trimmed) {
            setError("Paste the verification token from your email.")
            return
        }
        runVerify(trimmed)
    }

    const handleRecoverySuccess = (newEmail: string) => {
        updateSignupVerificationEmail(newEmail)
        setStashed(readSignupVerification())
        setInfo(`If your account is eligible, a verification link is on its way to ${newEmail}. Check your inbox in a few minutes. If you don't get an email, your account may already be verified, try logging in instead.`)
        setRecoveryOpen(false)
    }

    const targetEmail = stashed?.email ?? null
    const isOauthSignup = Boolean(stashed?.provider)

    return (
        <CardShell title="Verify your email">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                    {targetEmail
                        ? `We sent a verification link to ${targetEmail}. Click the link in the email to verify.`
                        : "Click the verification link in your email."}
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="verify-code">Verification token</Label>
                        <Input
                            id="verify-code"
                            type="text"
                            autoComplete="one-time-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    {error && (
                        <AlertBanner variant="error">{error}</AlertBanner>
                    )}
                    {info && !error && (
                        <AlertBanner variant="success">{info}</AlertBanner>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="submit"
                            disabled={submitting || !code.trim()}
                        >
                            {submitting ? "Verifying..." : "Verify"}
                        </Button>
                    </div>
                </form>
                {!isOauthSignup && (
                    <div className="border-t border-border/40 pt-4">
                        <button
                            type="button"
                            onClick={() => setRecoveryOpen((v) => !v)}
                            className="text-sm text-primary underline-offset-2 hover:underline"
                        >
                            {recoveryOpen ? "Hide" : "I never got the code"}
                        </button>
                        {recoveryOpen && (
                            <div className="mt-3">
                                <EmailRecoveryForm onSuccess={handleRecoverySuccess} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </CardShell>
    )
}

type VerifyState =
    | { kind: "idle" }
    | { kind: "pending" }
    | { kind: "error", code: string | null }

function EmailChangeVerifyContent({ pendingEmail }: { pendingEmail: string | null }) {
    const { key } = useParams<{ key?: string }>()
    const navigate = useNavigate()
    const qc = useQueryClient()
    const resend = useResendEmailChange()

    const [verifyState, setVerifyState] = useState<VerifyState>({ kind: "idle" })
    const [info, setInfo] = useState<string | null>(null)
    const [resendError, setResendError] = useState<string | null>(null)
    const [cooldown, setCooldown] = useState(0)
    const autoSubmittedRef = useRef(false)

    useEffect(() => {
        if (cooldown <= 0) return
        const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
        return () => window.clearTimeout(id)
    }, [cooldown])

    useEffect(() => {
        if (autoSubmittedRef.current) return
        const trimmed = key?.trim()
        if (!trimmed) return
        autoSubmittedRef.current = true

        setVerifyState({ kind: "pending" })
        verifyEmailChangeFn(trimmed)
            .then(() => {
                qc.invalidateQueries({ queryKey: queryKeys.auth.email() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
                toast.success(
                    pendingEmail
                        ? `Email updated to ${pendingEmail}!`
                        : "Email change confirmed!",
                    {
                        description: "We sent a confirmation to your previous address.",
                    },
                )
                navigate("/profile/settings/security")
            })
            .catch((err) => {
                const code = err instanceof ApiError ? err.code : null
                setVerifyState({ kind: "error", code })
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    const handleResend = () => {
        setInfo(null)
        setResendError(null)
        resend.mutate(undefined, {
            onSuccess: () => {
                setInfo(
                    pendingEmail
                        ? `We've sent a fresh verification email to ${pendingEmail}!`
                        : "We've sent a fresh verification email!",
                )
                setCooldown(RESEND_COOLDOWN_SECONDS)
            },
            onError: (err) => {
                if (err instanceof ApiError && err.isRateLimited) {
                    const retry = err.retryAfter ?? RESEND_COOLDOWN_SECONDS
                    setCooldown(retry)
                    setResendError(
                        `Too many attempts. Try again in ${formatRetryAfter(retry)}.`,
                    )
                    return
                }
                const apiCode = err instanceof ApiError ? err.code : null
                setResendError(mapResendEmailChangeError(apiCode))
            },
        })
    }

    const verifying = verifyState.kind === "pending"
    const verifyApiCode = verifyState.kind === "error" ? verifyState.code : null
    const verifyError = verifyState.kind === "error"
        ? mapVerifyEmailChangeError(verifyApiCode)
        : null
    const displayError = verifyError ?? resendError
    const showResend = pendingEmail !== null && verifyApiCode !== "no_pending_change"
    const showGoToProfile = verifyApiCode === "no_pending_change"

    return (
        <CardShell title="Confirm your new email">
            <div className="flex flex-col gap-4">
                {pendingEmail && (
                    <p className="text-sm text-muted-foreground">
                        Pending change to{" "}
                        <span className="text-foreground font-medium">{pendingEmail}</span>.
                    </p>
                )}
                {verifying && (
                    <p className="text-sm text-muted-foreground">Verifying the link...</p>
                )}
                {!verifying && !displayError && pendingEmail && (
                    <p className="text-sm text-muted-foreground">
                        Click the link in your email, or use Resend below if you didn't get it.
                    </p>
                )}
                {displayError && <AlertBanner variant="error">{displayError}</AlertBanner>}
                {info && !displayError && (
                    <AlertBanner variant="success">{info}</AlertBanner>
                )}
                <div className="flex flex-wrap items-center gap-3">
                    {showResend && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleResend}
                            disabled={resend.isPending || cooldown > 0 || verifying}
                        >
                            {cooldown > 0
                                ? `Resend (${cooldown}s)`
                                : resend.isPending
                                    ? "Sending..."
                                    : "Resend code"}
                        </Button>
                    )}
                    {showGoToProfile && (
                        <Button
                            type="button"
                            onClick={() => navigate("/profile/settings/security")}
                        >
                            Go to profile
                        </Button>
                    )}
                </div>
            </div>
        </CardShell>
    )
}

function NoPendingContent() {
    const navigate = useNavigate()
    return (
        <CardShell title="Nothing to verify">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                    There's no pending email verification on your account. Your address may already be verified, or this link has been used.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        type="button"
                        onClick={() => navigate("/profile/settings/security")}
                    >
                        Go to profile
                    </Button>
                </div>
            </div>
        </CardShell>
    )
}
