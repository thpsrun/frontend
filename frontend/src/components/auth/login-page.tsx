import { useState } from "react"
import { useNavigate, Navigate, Link } from "react-router"
import { useSession } from "@/hooks/auth/useSession"
import { useLogin, useSubmitTotp } from "@/hooks/auth/useLogin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/profile/form-field"
import { OAuthProviderButton } from "@/components/auth/oauth-provider-button"
import { PasskeyLoginButton } from "@/components/auth/passkey-login-button"

type LoginStep = "login" | "totp" | "email-verification"

export function LoginPage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useSession()
    const login = useLogin()
    const submitTotp = useSubmitTotp()

    const [loginValue, setLoginValue] = useState("")
    const [password, setPassword] = useState("")
    const [totpCode, setTotpCode] = useState("")
    const [step, setStep] = useState<LoginStep>("login")
    const [error, setError] = useState<string | null>(null)

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    const handleLogin = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setError(null)

        try {
            const result = await login.mutateAsync({
                username: loginValue,
                password,
            })
            if (result.mfaRequired) {
                setStep("totp")
            } else if (result.emailVerificationRequired) {
                setStep("email-verification")
            } else {
                navigate("/")
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred.",
            )
        }
    }

    const handleTotp = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setError(null)

        try {
            await submitTotp.mutateAsync(totpCode)
            navigate("/")
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred.",
            )
        }
    }

    const titles: Record<LoginStep, string> = {
        "login": "Log In",
        "totp": "Two-Factor Authentication",
        "email-verification": "Check your Email",
    }

    return (
        <div className="flex justify-center pt-12">
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
                                disabled={submitTotp.isPending}
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
                                <Button
                                    type="submit"
                                    disabled={login.isPending}
                                >
                                    {login.isPending ? "Logging In..." : "Log In"}
                                </Button>
                            </form>

                            <div className="flex flex-col gap-2">
                                <PasskeyLoginButton />
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
