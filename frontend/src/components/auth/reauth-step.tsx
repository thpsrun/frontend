import { useState } from "react"
import type { SyntheticEvent } from "react"
import { ApiError } from "@/lib/api-client"
import { mapReauthError, oauthReauthErrorMessage } from "@/lib/auth-errors"
import { runOAuthReauth } from "@/lib/oauth-reauth"
import { reauthenticateFn } from "@/hooks/auth/auth-api"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import type { AuthProvider } from "@/types/auth"
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/profile/form-field"

const PROVIDER_LABEL: Record<AuthProvider, string> = {
    discord: "Discord",
    twitch: "Twitch",
}

interface Props {
    onSuccess: () => void
    onCancel: () => void
    title?: string
    description?: string
}

export function ReauthStep({
    onSuccess,
    onCancel,
    title = "Verify yourself",
    description,
}: Props) {
    const { data: methods } = useAuthMethods()
    const hasUsablePassword = methods?.has_usable_password ?? true
    const firstSocial = methods?.social_accounts[0] ?? null
    const useOAuthFlow = !hasUsablePassword
    const noReauthAvailable = useOAuthFlow && !firstSocial
    const providerLabel = firstSocial
        ? PROVIDER_LABEL[firstSocial.provider]
        : ""

    const [password, setPassword] = useState("")
    const [reauthing, setReauthing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handlePassword = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!password) return
        setError(null)
        setReauthing(true)
        try {
            await reauthenticateFn(password)
            setReauthing(false)
            setPassword("")
            onSuccess()
        } catch (err) {
            setReauthing(false)
            setError(mapReauthError(err instanceof ApiError ? err.code : null))
        }
    }

    const handleOAuth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!firstSocial) return
        setError(null)
        setReauthing(true)
        const result = await runOAuthReauth(firstSocial.provider)
        setReauthing(false)
        if (result.ok) {
            onSuccess()
            return
        }
        setError(oauthReauthErrorMessage(result.reason, providerLabel))
    }

    const defaultDescription = useOAuthFlow
        ? `Verify with ${providerLabel} to continue!`
        : "Enter your password to continue!"

    return (
        <form
            onSubmit={useOAuthFlow ? handleOAuth : handlePassword}
            className="flex flex-col gap-4"
        >
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            {noReauthAvailable ? (
                <p className="text-sm text-muted-foreground">
                    You need a password or a linked account to verify yourself.
                    Add one in the other settings sections first.
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">
                    {description ?? defaultDescription}
                </p>
            )}
            {error && <div className="text-sm text-destructive">{error}</div>}
            {!useOAuthFlow && !noReauthAvailable && (
                <FormField
                    label="Current Password"
                    id="reauth-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            )}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                {!noReauthAvailable && (
                    <Button
                        type="submit"
                        disabled={reauthing || (!useOAuthFlow && !password)}
                    >
                        {useOAuthFlow
                            ? reauthing
                                ? "Verifying..."
                                : `Verify with ${providerLabel}`
                            : reauthing
                                ? "Verifying..."
                                : "Verify"}
                    </Button>
                )}
            </DialogFooter>
        </form>
    )
}
