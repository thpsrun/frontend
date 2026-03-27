import { useState } from "react"
import { useNavigate, Navigate, Link } from "react-router"
import { useAuth } from "@/hooks/auth/useAuth"
import { OAUTH_BASE_URL } from "@/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Login flow: credentials -> optional TOTP -> optional email verification
type LoginStep = "login" | "totp" | "email-verification"

export function LoginPage() {
    const navigate = useNavigate()
    const { login, submitTotp, isAuthenticated } = useAuth()

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
            <Card className="w-full max-w-[400px]">
                <CardHeader>
                    <CardTitle className="text-xl">
                        {titles[step]}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {error && (
                        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {step === "email-verification" ? (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Please verify your email address before logging in.
                                Check your inbox for a verification link.
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
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="totp-code">Code</Label>
                                <Input
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
                            </div>
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
                                Back to login
                            </button>
                        </form>
                    ) : (
                        <>
                            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="login">Username or Email</Label>
                                    <Input
                                        id="login"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="Username or email"
                                        value={loginValue}
                                        onChange={(e) => setLoginValue(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={login.isPending}
                                >
                                    {login.isPending ? "Logging in..." : "Log In"}
                                </Button>
                            </form>

                            <div className="relative flex items-center">
                                <div className="flex-1 border-t border-border" />
                                <span className="px-3 text-xs text-muted-foreground">or</span>
                                <div className="flex-1 border-t border-border" />
                            </div>

                            <Button variant="outline" disabled>
                                Passkeys (Coming Soon)
                            </Button>

                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        window.location.href = `${OAUTH_BASE_URL}/discord/login/`
                                    }}
                                >
                                    Log in with Discord
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        window.location.href = `${OAUTH_BASE_URL}/twitch/login/`
                                    }}
                                >
                                    Log in with Twitch
                                </Button>
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link
                                    to="/register"
                                    className="text-foreground underline underline-offset-4 hover:text-primary"
                                >
                                    Register
                                </Link>
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
