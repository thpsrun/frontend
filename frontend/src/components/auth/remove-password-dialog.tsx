import { useState } from "react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api-client"
import { mapDeletePasswordError } from "@/lib/auth-errors"
import type { DeletePasswordMode } from "@/lib/auth-errors"
import { useDeletePassword } from "@/hooks/auth/useDeletePassword"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/profile/form-field"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function RemovePasswordDialog({ open, onOpenChange }: Props) {
    const { data: methods } = useAuthMethods()
    const remove = useDeletePassword()

    const [mode, setMode] = useState<DeletePasswordMode>("password")
    const [value, setValue] = useState("")
    const [error, setError] = useState<string | null>(null)

    const hasTotp = methods?.authenticators.some((a) => a.type === "totp") ?? false

    const reset = () => {
        setMode("password")
        setValue("")
        setError(null)
    }

    const handleOpenChange = (next: boolean) => {
        if (!next) reset()
        onOpenChange(next)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!value) return
        setError(null)
        const body = mode === "password"
            ? { password: value }
            : { mfa_code: value }
        remove.mutate(body, {
            onSuccess: () => {
                toast.success(
                    "Password removed. You'll sign in with OAuth or passkey next time.",
                )
                handleOpenChange(false)
            },
            onError: (err) => {
                const code = err instanceof ApiError ? err.code : null
                setError(mapDeletePasswordError(code, mode))
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Remove password</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        After you remove your your password, you will only be able to login with
                        OAuth and Passkeys.
                    </p>
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    {mode === "password" ? (
                        <>
                            <FormField
                                label="Current password"
                                id="remove-pw-password"
                                type="password"
                                autoComplete="current-password"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                required
                            />
                            {hasTotp && (
                                <button
                                    type="button"
                                    className="text-left text-sm text-muted-foreground underline-offset-2 hover:underline"
                                    onClick={() => {
                                        setMode("mfa")
                                        setValue("")
                                        setError(null)
                                    }}
                                >
                                    Use authenticator code instead:
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <FormField
                                label="Authenticator code"
                                id="remove-pw-mfa"
                                type="text"
                                autoComplete="one-time-code"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                required
                                placeholder="6-digit TOTP or 8-character recovery code"
                            />
                            <button
                                type="button"
                                className="text-left text-sm text-muted-foreground underline-offset-2 hover:underline"
                                onClick={() => {
                                    setMode("password")
                                    setValue("")
                                    setError(null)
                                }}
                            >
                                : Use password instead
                            </button>
                        </>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={remove.isPending || !value}
                        >
                            {remove.isPending ? "Removing..." : "Remove password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
