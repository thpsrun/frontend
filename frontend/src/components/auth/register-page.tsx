import { useState } from "react"
import { useNavigate, Navigate, Link } from "react-router"
import { useSession } from "@/hooks/auth/useSession"
import { useRegister } from "@/hooks/auth/useRegister"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/components/profile/form-field"
import {
    validateUsername,
    validatePassword,
    validateEmail,
} from "@/lib/validation"

export function RegisterPage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useSession()
    const register = useRegister()

    const [srcApiKey, setSrcApiKey] = useState("")
    const [saveKey, setSaveKey] = useState(false)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")

    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
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
            await register.mutateAsync({
                src_api_key: srcApiKey,
                save_key: saveKey,
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
            <Card className="w-full max-w-100">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Register
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {error && (
                        <AlertBanner variant="error">
                            {error}
                        </AlertBanner>
                    )}

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
                                        Keep Key:
                                    </strong>
                                    {" "}Submit runs to SRC from thps.run, approve runs if you are a
                                    moderator, and manage profile settings.
                                </li>
                                <li>
                                    <strong className="text-foreground">
                                        Remove Key:
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

                    <form
                        onSubmit={handleRegister}
                        className="flex flex-col gap-4"
                    >
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
                        <Button
                            type="submit"
                            disabled={register.isPending}
                        >
                            {register.isPending
                                ? "Creating Account..."
                                : "Create Account"}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-foreground underline underline-offset-4 hover:text-primary"
                            >
                                Log In
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
