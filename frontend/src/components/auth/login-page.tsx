import { useState } from "react"
import type { SyntheticEvent } from "react"
import { useNavigate, Navigate, Link, useLocation } from "react-router"
import { useSession } from "@/hooks/auth/useSession"
import { useLogin, useSubmitTotp } from "@/hooks/auth/useLogin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormField } from "@/components/profile/form-field"
import { OAuthProviderButton } from "@/components/auth/oauth-provider-button"
import { PasskeyLoginButton } from "@/components/auth/passkey-login-button"
import {
    peekRememberMeStash,
    stashRememberMe,
} from "@/lib/remember-me"

type LoginStep = "login" | "totp" | "email-verification"

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

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated } = useSession()
    const login = useLogin()
    const submitTotp = useSubmitTotp()

    const returnTo = getReturnTo(location.state)

    const [loginValue, setLoginValue] = useState("")
    const [password, setPassword] = useState("")
    const [totpCode, setTotpCode] = useState("")
    const [rememberMe, setRememberMe] = useState<boolean>(() =>
        peekRememberMeStash(),
    )
    const [step, setStep] = useState<LoginStep>("login")
    const [error, setError] = useState<string | null>(null)

    if (isAuthenticated) {
        return <Navigate to={returnTo} replace />
    }

    const handleLogin = async (e: SyntheticEvent) => {
        e.preventDefault()
        setError(null)

        try {
            const result = await login.mutateAsync({
                data: { username: loginValue, password },
                options: { rememberMe },
            })
            if (result.mfaRequired) {
                setStep("totp")
            } else if (result.emailVerificationRequired) {
                setStep("email-verification")
            } else {
                navigate(returnTo)
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred.",
            )
        }
    }

    const handleTotp = async (e: SyntheticEvent) => {
        e.preventDefault()
        setError(null)

        try {
            await submitTotp.mutateAsync(totpCode)
            navigate(returnTo)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred.",
            )
        }
    }

    const handleRememberMeChange = (checked: boolean) => {
        setRememberMe(checked)
        stashRememberMe(checked)
    }

    const titles: Record<LoginStep, string> = {
        "login": "Log In",
        "totp": "Two-Factor Authentication",
        "email-verification": "Check your Email",
    }

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-100">
                <CardHeader>
                    <CardTitle className="text-xl">
                        {titles[step]}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {error && (
                        <AlertBanner variant="error">
                            {error}
                        </AlertBanner>
                    )}

                    {step === "email-verification" ? (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Please verify your email address before logging in.
                                Check your inbox for a verification link. If you are having
                                issues, contact Anastasia on the Discord.
                            </p>
                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    setStep("login")
                                    setError(null)
                                }}
                            >
                                Back to login
                            </button>
                        </div>
                    ) : step === "totp" ? (
                        <form onSubmit={handleTotp} className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Enter the 6-digit code from your authenticator app.
                            </p>
                            <FormField
                                label="Code"
                                id="totp-code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder="000000"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                required
                            />
                            <Button
                                type="submit"
                                disabled={
                                    submitTotp.isPending
                                    || totpCode.length !== 6
                                }
                            >
                                {submitTotp.isPending ? "Verifying..." : "Verify"}
                            </Button>
                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    setStep("login")
                                    setTotpCode("")
                                    setError(null)
                                }}
                            >
                                Back to Login
                            </button>
                        </form>
                    ) : (
                        <>
                            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                                <FormField
                                    label="Username/Email"
                                    id="login"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Username/Email"
                                    value={loginValue}
                                    onChange={(e) => setLoginValue(e.target.value)}
                                    required
                                />
                                <FormField
                                    label="Password"
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember-me"
                                        checked={rememberMe}
                                        onCheckedChange={(value) =>
                                            handleRememberMeChange(value === true)
                                        }
                                    />
                                    <Label
                                        htmlFor="remember-me"
                                        className="cursor-pointer"
                                    >
                                        Log In For 30 Days
                                    </Label>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={
                                        login.isPending
                                        || !loginValue.trim()
                                        || !password
                                    }
                                >
                                    {login.isPending ? "Logging In..." : "Log In"}
                                </Button>
                            </form>

                            <div className="flex flex-col gap-2">
                                <PasskeyLoginButton rememberMe={rememberMe} />
                                <OAuthProviderButton
                                    provider="discord"
                                    process="login"
                                    callbackPath="/oauth/callback"
                                    fullWidth
                                >
                                    Sign in with Discord
                                </OAuthProviderButton>
                                <OAuthProviderButton
                                    provider="twitch"
                                    process="login"
                                    callbackPath="/oauth/callback"
                                    fullWidth
                                >
                                    Sign in with Twitch
                                </OAuthProviderButton>
                                <p className="text-xs text-muted-foreground">
                                    Discord and Twitch sign-ins stay signed in for 7 days.
                                </p>
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="text-foreground underline underline-offset-4 hover:text-primary"
                                >
                                    Register
                                </Link>
                            </p>
                            <p className="text-center text-xs text-muted-foreground">
                                Note: To register, you need to have at least one speedrun imported from Speedrun.com (SRC).
                                If you submitted a run on SRC, it will be imported automatically.
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
