import { useState } from "react"
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
    providerLabel: string
}

export function DisconnectProviderDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending,
    providerLabel,
}: Props) {
    const [password, setPassword] = useState("")

    const handleOpenChange = (next: boolean) => {
        if (!next) setPassword("")
        onOpenChange(next)
    }

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault()
        if (!password) return
        onConfirm(password)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <form onSubmit={handleConfirm} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Disconnect {providerLabel}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Confirm your account password to disconnect{" "}
                        <span className="font-medium">{providerLabel}</span>
                        {" "}from your thps.run account.
                    </p>
                    <FormField
                        label="Password"
                        id="disconnect-provider-password"
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
                            {isPending ? "Disconnecting..." : "Disconnect"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
