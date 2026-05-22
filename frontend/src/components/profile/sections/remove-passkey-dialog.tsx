import { useEffect, useState } from "react"
import type { SyntheticEvent } from "react"
import { ApiError } from "@/lib/api-client"
import { mapReauthError, oauthReauthErrorMessage } from "@/lib/auth-errors"
import { runOAuthReauth } from "@/lib/oauth-reauth"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import { useDeletePasskey } from "@/hooks/auth/useDeletePasskey"
import { reauthenticateFn } from "@/hooks/auth/auth-api"
import type { AuthProvider } from "@/types/auth"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/profile/form-field"

interface Target {
    id: string
    name: string
}

interface Props {
    target: Target | null
    onClose: () => void
}

const PROVIDER_LABEL: Record<AuthProvider, string> = {
    discord: "Discord",
    twitch: "Twitch",
}

export function RemovePasskeyDialog({ target, onClose }: Props) {
    const remove = useDeletePasskey()
    const { data: methods } = useAuthMethods()
    const hasUsablePassword = methods?.has_usable_password ?? true
    const firstSocial = methods?.social_accounts[0] ?? null

    const [password, setPassword] = useState("")
    const [reauthing, setReauthing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setPassword("")
        setReauthing(false)
        setError(null)
    }, [target])

    const attemptRemove = () => {
        if (!target) return
        setError(null)
        remove.mutate(target.id, {
            onSuccess: () => onClose(),
            onError: (err) => {
                const msg = err instanceof ApiError
                    ? err.message
                    : "Couldn't remove Passkey. Please try again..."
                setError(msg)
            },
        })
    }

    const handlePasswordSubmit = async (
        e: SyntheticEvent<HTMLFormElement>,
    ) => {
        e.preventDefault()
        if (!password) return
        setError(null)
        setReauthing(true)
        try {
            await reauthenticateFn(password)
            setReauthing(false)
            setPassword("")
            attemptRemove()
        } catch (err) {
            setReauthing(false)
            const code = err instanceof ApiError ? err.code : null
            setError(mapReauthError(code))
        }
    }

    const handleOAuthSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!firstSocial) return
        setError(null)
        setReauthing(true)
        const result = await runOAuthReauth(firstSocial.provider)
        setReauthing(false)
        if (result.ok) {
            attemptRemove()
            return
        }
        setError(
            oauthReauthErrorMessage(
                result.reason,
                PROVIDER_LABEL[firstSocial.provider],
            ),
        )
    }

    const useOAuthFlow = !hasUsablePassword
    const noReauthAvailable = useOAuthFlow && !firstSocial
    const submitting = remove.isPending || reauthing
    const providerLabel = firstSocial
        ? PROVIDER_LABEL[firstSocial.provider]
        : ""
    const passkeyName = target?.name ?? "Passkey"

    return (
        <Dialog
            open={target !== null}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent>
                <form
                    onSubmit={useOAuthFlow ? handleOAuthSubmit : handlePasswordSubmit}
                    className="flex flex-col gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>Remove Passkey</DialogTitle>
                    </DialogHeader>
                    {noReauthAvailable ? (
                        <p className="text-sm text-muted-foreground">
                            You need a password or a linked account to verify
                            yourself before removing a passkey. Add one in the
                            other settings sections first.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {useOAuthFlow
                                ? `Verify with ${providerLabel} to remove the passkey labeled `
                                : "Confirm your password to remove the passkey labeled "}
                            <span className="font-medium">{passkeyName}</span>.
                        </p>
                    )}
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    {!useOAuthFlow && !noReauthAvailable && (
                        <FormField
                            label="Current Password"
                            id="remove-passkey-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        {!noReauthAvailable && (
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={
                                    submitting
                                    || (!useOAuthFlow && !password)
                                }
                            >
                                {useOAuthFlow
                                    ? (reauthing
                                        ? "Verifying..."
                                        : `Verify with ${providerLabel} and Remove`)
                                    : (submitting
                                        ? "Removing..."
                                        : "Remove Passkey")}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
