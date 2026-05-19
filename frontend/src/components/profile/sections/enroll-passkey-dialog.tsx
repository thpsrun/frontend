import { useState } from "react"
import type { SyntheticEvent } from "react"
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
    onConfirm: (name: string, password: string) => void
    isPending: boolean
}

export function EnrollPasskeyDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending,
}: Props) {
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            // Clear so a re-open starts fresh.
            setName("")
            setPassword("")
        }
        onOpenChange(next)
    }

    const handleConfirm = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const trimmedName = name.trim()
        if (!trimmedName || !password) return
        onConfirm(trimmedName, password)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <form onSubmit={handleConfirm} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Add a passkey</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Give this passkey a label so you can identify it later
                        (for example, "MacBook Touch ID" or "YubiKey 5"), and
                        confirm your account password to authorize the change.
                    </p>
                    <FormField
                        label="Label"
                        id="passkey-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="MacBook Touch ID"
                        required
                    />
                    <FormField
                        label="Password"
                        id="passkey-confirm-password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
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
                            disabled={isPending || !name.trim() || !password}
                        >
                            {isPending ? "Waiting for passkey..." : "Continue"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
