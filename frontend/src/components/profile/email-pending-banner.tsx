import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api-client"
import { mapResendEmailChangeError } from "@/lib/auth-errors"
import { formatRetryAfter } from "@/lib/utils"
import { useResendEmailChange } from "@/hooks/auth/useResendEmailChange"
import { useCancelEmailChange } from "@/hooks/auth/useCancelEmailChange"
import { Button } from "@/components/ui/button"

const RESEND_COOLDOWN_SECONDS = 60

interface Props {
    pendingEmail: string
}

export function EmailPendingBanner({ pendingEmail }: Props) {
    const resend = useResendEmailChange()
    const cancel = useCancelEmailChange()

    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        setError(null)
        setInfo(null)
        setCooldown(0)
    }, [pendingEmail])

    useEffect(() => {
        if (cooldown <= 0) return
        const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
        return () => window.clearTimeout(id)
    }, [cooldown])

    const handleResend = () => {
        setError(null)
        setInfo(null)
        resend.mutate(undefined, {
            onSuccess: () => {
                setInfo(`We've sent a fresh verification email to ${pendingEmail}.`)
                setCooldown(RESEND_COOLDOWN_SECONDS)
            },
            onError: (err) => {
                if (err instanceof ApiError && err.isRateLimited) {
                    const retry = err.retryAfter ?? RESEND_COOLDOWN_SECONDS
                    setCooldown(retry)
                    setError(
                        `Too many attempts. Try again in ${formatRetryAfter(retry)}.`,
                    )
                    return
                }
                const apiCode = err instanceof ApiError ? err.code : null
                setError(mapResendEmailChangeError(apiCode))
            },
        })
    }

    const handleCancel = () => {
        setError(null)
        setInfo(null)
        cancel.mutate(undefined, {
            onSuccess: () => {
                toast.success("Pending email change cancelled.")
            },
            onError: () => {
                setError("We couldn't cancel the pending change. Please try again.")
            },
        })
    }

    return (
        <div className="flex flex-col gap-3 rounded border border-amber-500/40 bg-amber-500/5 p-3">
            <p className="text-sm">
                We sent a verification email to <strong>{pendingEmail}</strong>. Click the link in that email to confirm the change. Your current email stays in place until you do.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {info && !error && (
                <p className="text-sm text-muted-foreground">{info}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleResend}
                    disabled={resend.isPending || cooldown > 0}
                >
                    {cooldown > 0
                        ? `Resend (${cooldown}s)`
                        : resend.isPending
                            ? "Sending..."
                            : "Resend email"}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={cancel.isPending}
                >
                    {cancel.isPending ? "Cancelling..." : "Cancel"}
                </Button>
            </div>
        </div>
    )
}
