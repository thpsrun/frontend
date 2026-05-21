import { useEffect, useState } from "react"
import type { SyntheticEvent } from "react"
import { useNavigate } from "react-router"
import { SiDiscord, SiTwitch } from "@icons-pack/react-simple-icons"
import { ApiError } from "@/lib/api-client"
import {
    consumeSignupDraft,
    peekSignupDraft,
} from "@/lib/oauth-flow"
import { mapOauthSignupError } from "@/lib/oauth-signup-errors"
import { useFinalizeOauthSignup } from "@/hooks/auth/useFinalizeOauthSignup"
import {
    validateEmail,
    validateUsername,
} from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertBanner } from "@/components/common/alert-banner"
import { FormField } from "@/components/profile/form-field"
import type { OauthSignupDraft, AuthProvider } from "@/types/auth"

type Mode = "auto-submitting" | "recoverable" | "hard" | "lost"

const PROVIDER_LABEL: Record<AuthProvider, string> = {
    discord: "Discord",
    twitch: "Twitch",
}

const PROVIDER_ICON: Record<AuthProvider, typeof SiDiscord> = {
    discord: SiDiscord,
    twitch: SiTwitch,
}

const PROVIDER_BRAND: Record<AuthProvider, string> = {
    discord: "#5865F2",
    twitch: "#9146FF",
}

export function CompleteSignupCard() {
    const navigate = useNavigate()
    const finalize = useFinalizeOauthSignup()

    const initialDraft = peekSignupDraft()
    const [draft, setDraft] = useState<OauthSignupDraft | null>(initialDraft)
    const [mode, setMode] = useState<Mode>(
        initialDraft === null ? "lost" : "auto-submitting",
    )
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [autoSubmitDone, setAutoSubmitDone] = useState(false)

    const handleError = (err: unknown) => {
        const code = err instanceof ApiError ? err.code : null
        const { message, recoverable } = mapOauthSignupError(code)
        if (recoverable) {
            setMode("recoverable")
            setError(message)
        } else {
            consumeSignupDraft()
            setMode("hard")
            setError(message)
        }
    }

    useEffect(() => {
        if (autoSubmitDone || draft === null) return
        setAutoSubmitDone(true)
        finalize.mutate(
            {
                username: draft.username,
                email: draft.email,
                src_api_key: draft.src_api_key,
            },
            {
                onSuccess: () => {
                    consumeSignupDraft()
                    navigate("/", { replace: true })
                },
                onError: (err) => {
                    handleError(err)
                },
            },
        )
    }, [])

    const handleResubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!draft) return

        const errors: Record<string, string> = {}
        const usernameErr = validateUsername(draft.username)
        if (usernameErr) errors.username = usernameErr
        const emailErr = validateEmail(draft.email)
        if (emailErr) errors.email = emailErr
        if (!draft.src_api_key.trim()) {
            errors.src_api_key = "SRC API key is required."
        }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }
        setFieldErrors({})
        setError(null)

        finalize.mutate(
            {
                username: draft.username,
                email: draft.email,
                src_api_key: draft.src_api_key,
            },
            {
                onSuccess: () => {
                    consumeSignupDraft()
                    navigate("/", { replace: true })
                },
                onError: handleError,
            },
        )
    }

    if (mode === "lost") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Signup state lost</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                        We couldn't recover your signup details. Please start
                        again from the registration page.
                    </p>
                    <Button onClick={() => navigate("/register", { replace: true })}>
                        Back to Register
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (mode === "auto-submitting") {
        return (
            <div className="text-center text-sm text-muted-foreground">
                Completing Signup...
            </div>
        )
    }

    if (mode === "hard") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Signup Issue</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {error && <AlertBanner variant="error">{error}</AlertBanner>}
                    <Button
                        variant="outline"
                        onClick={() => navigate("/register", { replace: true })}
                    >
                        Back to register
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (draft === null) return null

    const Icon = PROVIDER_ICON[draft.provider]
    const providerColor = PROVIDER_BRAND[draft.provider]
    const providerLabel = PROVIDER_LABEL[draft.provider]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Complete your signup</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleResubmit} className="flex flex-col gap-4">
                    {error && <AlertBanner variant="error">{error}</AlertBanner>}
                    <FormField
                        label="SRC API key"
                        id="signup-src-api-key"
                        type="text"
                        value={draft.src_api_key}
                        onChange={(e) =>
                            setDraft({ ...draft, src_api_key: e.target.value })
                        }
                        error={fieldErrors.src_api_key}
                        required
                    />
                    <FormField
                        label="Username"
                        id="signup-username"
                        type="text"
                        value={draft.username}
                        onChange={(e) =>
                            setDraft({ ...draft, username: e.target.value })
                        }
                        error={fieldErrors.username}
                        required
                    />
                    <FormField
                        label="Email"
                        id="signup-email"
                        type="email"
                        value={draft.email}
                        onChange={(e) =>
                            setDraft({ ...draft, email: e.target.value })
                        }
                        error={fieldErrors.email}
                        required
                    />
                    <Button
                        type="submit"
                        disabled={finalize.isPending}
                        className="self-stretch"
                    >
                        <Icon size={16} color={providerColor} className="mr-1" />
                        {finalize.isPending
                            ? "Completing..."
                            : `Complete signup with ${providerLabel}`}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
