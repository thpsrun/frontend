import { useRef, useState } from "react"
import type { SyntheticEvent } from "react"
import { useNavigate, Navigate, Link, useLocation } from "react-router"
import { useSession } from "@/hooks/auth/useSession"
import { useRegister } from "@/hooks/auth/useRegister"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/components/profile/form-field"
import {
    validateUsername,
    validatePassword,
    validateEmail,
} from "@/lib/validation"
import { SiDiscord, SiTwitch } from "@icons-pack/react-simple-icons"
import { useOauthSignup } from "@/hooks/auth/useOauthSignup"
import { ApiError } from "@/lib/api-client"
import { oauthSignupErrorMessage, turnstileErrorMessage } from "@/lib/auth-errors"
import { mapFinalizeSignupError } from "@/lib/oauth-signup-errors"
import { isTurnstileEnabled } from "@/lib/turnstile"
import { stashSignupVerification } from "@/lib/signup-verification-state"
import {
    TurnstileWidget,
    type TurnstileWidgetHandle,
} from "@/components/auth/turnstile-widget"
import type { AuthProvider } from "@/types/auth"

function getReturnTo(state: unknown): string {
    if (
        state
        && typeof state === "object"
        && "from" in state
        && typeof (state as { from: unknown }).from === "string"
    ) {
        const from = (state as { from: string }).from
        if (from.startsWith("/") && !from.startsWith("//")) {
            return from
        }
    }
    return "/"
}

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

export function RegisterPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated } = useSession()
    const register = useRegister()
    const { signup: oauthSignup, pending: oauthPending } = useOauthSignup()

    const returnTo = getReturnTo(location.state)

    const [srcApiKey, setSrcApiKey] = useState("")
    const [saveKey, setSaveKey] = useState(false)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")

    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const turnstileRef = useRef<TurnstileWidgetHandle>(null)

    const turnstileEnabled = isTurnstileEnabled()
    const turnstileReady = !turnstileEnabled || turnstileToken !== null

    const resetTurnstile = () => {
        turnstileRef.current?.reset()
        setTurnstileToken(null)
    }

    const reportError = (err: unknown, fallback: string) => {
        if (err instanceof ApiError) {
            const tsMsg = turnstileErrorMessage(err.code)
            if (tsMsg) {
                setError(tsMsg)
                return
            }
        }
        setError(err instanceof Error ? err.message : fallback)
    }

    if (isAuthenticated) {
        return <Navigate to={returnTo} replace />
    }

    const validateSharedFields = (): boolean => {
        const errors: Record<string, string> = {}
        const usernameErr = validateUsername(username)
        if (usernameErr) errors.username = usernameErr
        const emailErr = validateEmail(email)
        if (emailErr) errors.email = emailErr
        if (!srcApiKey.trim()) {
            errors.srcApiKey = "SRC API key is required..."
        }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            setError("Fill in the required fields before signing up with Discord or Twitch.")
            return false
        }
        setFieldErrors({})
        setError(null)
        return true
    }

    const handleRegister = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setFieldErrors({})

        const errors: Record<string, string> = {}
        const usernameErr = validateUsername(username)
        if (usernameErr) errors.username = usernameErr

        const passwordErr = validatePassword(password1)
        if (passwordErr) errors.password1 = passwordErr

        if (password1 !== password2) {
            errors.password2 = "Passwords do not match, please verify."
        }

        const emailErr = validateEmail(email)
        if (emailErr) errors.email = emailErr

        if (!srcApiKey.trim()) {
            errors.srcApiKey = "SRC API key is required."
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        try {
            const result = await register.mutateAsync({
                src_api_key: srcApiKey,
                save_key: saveKey,
                username,
                email,
                password1,
                password2,
                turnstileToken,
            })
            if ("status" in result && result.status === "verification_required") {
                stashSignupVerification({
                    email: result.email,
                    src_user_id: result.src_user_id,
                    username: result.username,
                })
                navigate("/verify-email")
                return
            }
            navigate(returnTo)
        } catch (err) {
            resetTurnstile()
            reportError(err, "Registration failed...")
        }
    }

    const handleOauthSignup = async (provider: AuthProvider) => {
        if (!validateSharedFields()) return
        const tokenForCall = turnstileToken
        const result = await oauthSignup(
            provider,
            {
                username,
                email,
                src_api_key: srcApiKey,
                save_key: saveKey,
            },
            tokenForCall,
        )
        resetTurnstile()
        if (result.ok) {
            navigate(returnTo)
            return
        }
        if (result.kind === "finalize") {
            const tsMsg = turnstileErrorMessage(result.code)
            if (tsMsg) {
                setError(tsMsg)
                return
            }
        }
        const msg = result.kind === "popup"
            ? oauthSignupErrorMessage(result.reason, PROVIDER_LABEL[provider])
            : mapFinalizeSignupError(result.code)
        setError(msg)
    }

    return (
        <div className="flex justify-center">
            <form
                onSubmit={handleRegister}
                className="w-full max-w-100 flex flex-col gap-6"
            >
                {error && (
                    <AlertBanner variant="error">
                        {error}
                    </AlertBanner>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">
                            Register
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <div className="rounded-md border border-border bg-muted/50 px-4 py-3">
                            <h3 className="text-sm font-semibold mb-2">
                                !!!! Registration Notes !!!!
                            </h3>
                            <div className="text-sm text-muted-foreground space-y-3">
                                <p>
                                    thps.run requires users to have at least one Tony Hawk speedrun
                                    pulled in from Speedrun.com. If you do not have one at LEAST
                                    submitted, you cannot register. This registration process will
                                    bind a brand new login with the data pulled in from your SRC profile.
                                </p>
                                <p>
                                    You can choose to keep or remove your SRC API key after registration:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <strong className="text-foreground">
                                            Save Key:
                                        </strong>
                                        {" "}Submit/edit runs to SRC from thps.run, approve runs if you are a
                                        moderator, and manage profile settings.
                                    </li>
                                    <li>
                                        <strong className="text-foreground">
                                            Not Saving:
                                        </strong>
                                        {" "} Only managing profile settings is available.
                                    </li>
                                </ul>
                                <p>
                                    Upon registration, metadata from your SRC profile (profile picture,
                                    pronouns, etc.) will no longer be pulled automatically, Only one
                                    thps.run account can be bound to an SRC account.
                                </p>
                                <p>
                                    You can add or remove your SRC API Key at any time in your profile settings.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <FormField
                                label="Username"
                                id="username"
                                type="text"
                                autoComplete="username"
                                placeholder="Choose a Username"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                error={fieldErrors.username}
                                required
                            />
                            <FormField
                                label="SRC API Key"
                                id="src-api-key"
                                type="text"
                                placeholder="3928ydsajhd018..."
                                value={srcApiKey}
                                onChange={(e) =>
                                    setSrcApiKey(e.target.value)
                                }
                                description={(
                                    <>
                                        <a
                                            href="https://www.speedrun.com/settings/api"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-foreground underline underline-offset-4 hover:text-primary"
                                        >
                                            speedrun.com/settings/api
                                        </a>
                                        {" "}- "Show API Key"
                                    </>
                                )}
                                error={fieldErrors.srcApiKey}
                                required
                            />
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="save-key"
                                    checked={saveKey}
                                    onCheckedChange={(checked) =>
                                        setSaveKey(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="save-key"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Save SRC API Key (encrypted)
                                </Label>
                            </div>
                        </div>

                        {turnstileEnabled && (
                            <div className="flex flex-col gap-1">
                                <TurnstileWidget
                                    ref={turnstileRef}
                                    onToken={setTurnstileToken}
                                    className="flex justify-center"
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    Required to create an account.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <FormField
                                label="Email"
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                error={fieldErrors.email}
                                required
                            />
                            <FormField
                                label="Password"
                                id="password1"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Password"
                                value={password1}
                                onChange={(e) =>
                                    setPassword1(e.target.value)
                                }
                                error={fieldErrors.password1}
                                required
                            />
                            <FormField
                                label="Confirm Password"
                                id="password2"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                value={password2}
                                onChange={(e) =>
                                    setPassword2(e.target.value)
                                }
                                error={fieldErrors.password2}
                                required
                            />
                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-foreground underline underline-offset-4 hover:text-primary"
                                >
                                    Log In
                                </Link>
                            </p>
                            <Button
                                type="submit"
                                disabled={
                                    register.isPending
                                    || !turnstileReady
                                    || !srcApiKey.trim()
                                    || !username.trim()
                                    || !email.trim()
                                    || !password1
                                    || !password2
                                }
                            >
                                {register.isPending
                                    ? "Creating Account..."
                                    : "Create Account"}
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {(["discord", "twitch"] as const).map((p) => {
                                const Icon = PROVIDER_ICON[p]
                                const isPending = oauthPending === p
                                return (
                                    <Button
                                        key={p}
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleOauthSignup(p)}
                                        disabled={
                                            oauthPending !== null
                                            || !turnstileReady
                                        }
                                        className="w-full"
                                    >
                                        <Icon
                                            size={16}
                                            color={PROVIDER_BRAND[p]}
                                            className="mr-1"
                                        />
                                        {isPending
                                            ? `Signing Up With ${PROVIDER_LABEL[p]}...`
                                            : `Sign Up With ${PROVIDER_LABEL[p]}`}
                                    </Button>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
