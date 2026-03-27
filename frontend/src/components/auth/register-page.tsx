import { useState } from "react"
import { useNavigate, Navigate, Link } from "react-router"
import { useAuth } from "@/hooks/auth/useAuth"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateUsername, validatePassword } from "@/lib/validation"

export function RegisterPage() {
    const navigate = useNavigate()
    const { verifySrc, register, isAuthenticated } = useAuth()

    const [step, setStep] = useState<1 | 2>(1)

    const [srcApiKey, setSrcApiKey] = useState("")
    const [verifiedPlayerName, setVerifiedPlayerName] = useState("")

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")

    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    const handleVerify = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setError(null)

        try {
            const result = await verifySrc.mutateAsync({
                src_api_key: srcApiKey,
            })
            setVerifiedPlayerName(result.player_name)
            setStep(2)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Verification failed.",
            )
        }
    }

    const handleRegister = async (e: React.SubmitEvent) => {
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

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address."
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        try {
            await register.mutateAsync({
                username,
                email,
                password1,
                password2,
            })
            navigate("/")
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Registration failed...",
            )
        }
    }

    return (
        <div className="flex justify-center pt-12">
            <Card className="w-full max-w-[400px]">
                <CardHeader>
                    <CardTitle className="text-xl">
                        {step === 1
                            ? "Registration & SRC Binding"
                            : "Create Your Account"}
                    </CardTitle>
                    {step === 2 && (
                        <CardDescription>
                            Registering as: <strong>{verifiedPlayerName}</strong>
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {error && (
                        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="flex flex-col gap-4">
                            <div className="rounded-md border border-border bg-muted/50 px-4 py-3">
                                <h3 className="text-sm font-semibold mb-2">
                                    Registration Notes
                                </h3>
                                <div className="text-sm text-muted-foreground space-y-3">
                                    <p>
                                        thps.run requires users to have at
                                        least one speedrun pulled in from
                                        Speedrun.com. This registration
                                        process will bind a brand new login
                                        with the data from your SRC profile.
                                        Once this is done, the following
                                        occurs:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            You will be able to submit
                                            speedruns on thps.run and it
                                            will be synced to SRC.
                                        </li>
                                        <li>
                                            You will be able to approve
                                            speedruns on thps.run and it
                                            will be synced to SRC (if you
                                            are a moderator).
                                        </li>
                                        <li>
                                            You will be able to add
                                            additional social media fields
                                            (e.g. Bluesky, Discord) that
                                            aren't automatically pulled
                                            from SRC.
                                        </li>
                                    </ul>
                                    <p>
                                        However, please note the following
                                        as well:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            Metadata from your SRC profile
                                            will no longer be pulled (to
                                            include your profile picture,
                                            pronouns, etc.).
                                        </li>
                                        <li>
                                            Only one thps.run account can
                                            be bound to an SRC account.
                                        </li>
                                    </ul>
                                    <p>
                                        Your SRC API Key is used to verify
                                        your account. The key is only used
                                        to verify you own your SRC account,
                                        find your bound user within the
                                        thps.run database, and bind your
                                        account to it. Once this process is
                                        completed, the key is deleted.
                                    </p>
                                    <p>
                                        For moderators, you can optionally
                                        import your key again in your
                                        profile settings upon completing
                                        setup.
                                    </p>
                                </div>
                            </div>
                            <form
                                onSubmit={handleVerify}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="src-api-key">
                                        SRC API Key
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {" "}
                                        <a
                                            href="https://www.speedrun.com/settings/api"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-foreground underline underline-offset-4 hover:text-primary"
                                        >
                                            speedrun.com/settings/api
                                        </a>
                                        {" "} - "Show API Key"
                                    </p>
                                    <Input
                                        id="src-api-key"
                                        type="text"
                                        placeholder="3928ydsajhd018..."
                                        value={srcApiKey}
                                        onChange={(e) =>
                                            setSrcApiKey(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={verifySrc.isPending}
                                >
                                    {verifySrc.isPending
                                        ? "Verifying..."
                                        : "Verify"}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="text-foreground underline underline-offset-4 hover:text-primary"
                                    >
                                        Log in
                                    </Link>
                                </p>
                            </form>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    aria-invalid={!!fieldErrors.username}
                                    required
                                />
                                {fieldErrors.username && (
                                    <p className="text-xs text-destructive">
                                        {fieldErrors.username}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-invalid={!!fieldErrors.email}
                                    required
                                />
                                {fieldErrors.email && (
                                    <p className="text-xs text-destructive">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password1">Password</Label>
                                <Input
                                    id="password1"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Password"
                                    value={password1}
                                    onChange={(e) => setPassword1(e.target.value)}
                                    aria-invalid={!!fieldErrors.password1}
                                    required
                                />
                                {fieldErrors.password1 && (
                                    <p className="text-xs text-destructive">
                                        {fieldErrors.password1}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password2">Confirm Password</Label>
                                <Input
                                    id="password2"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    aria-invalid={!!fieldErrors.password2}
                                    required
                                />
                                {fieldErrors.password2 && (
                                    <p className="text-xs text-destructive">
                                        {fieldErrors.password2}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={register.isPending}
                            >
                                {register.isPending
                                    ? "Creating Account..."
                                    : "Create Account"}
                            </Button>
                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    setStep(1)
                                    setError(null)
                                    setFieldErrors({})
                                }}
                            >
                                Back
                            </button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
