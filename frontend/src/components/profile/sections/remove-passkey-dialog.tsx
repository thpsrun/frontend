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
    onConfirm: (password: string) => void
    isPending: boolean
    passkeyName: string
}

export function RemovePasskeyDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending,
    passkeyName,
}: Props) {
    const [password, setPassword] = useState("")

    const handleOpenChange = (next: boolean) => {
        if (!next) setPassword("")
        onOpenChange(next)
    }

    const handleConfirm = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!password) return
        onConfirm(password)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <form onSubmit={handleConfirm} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Remove passkey</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Confirm your account password to remove the passkey
                        labeled <span className="font-medium">{passkeyName}</span>.
                    </p>
                    <FormField
                        label="Password"
                        id="remove-passkey-password"
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
                            variant="destructive"
                            disabled={isPending || !password}
                        >
                            {isPending ? "Removing..." : "Remove passkey"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
