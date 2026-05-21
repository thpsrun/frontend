import { useState } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/api-client"
import { getErrorMessage } from "@/lib/utils"
import { useRevokeApiKey } from "@/hooks/auth/useRevokeApiKey"
import { relativeTimeFrom } from "./relative-time"
import type { ApiKeyResponse } from "@/types/api-keys"

type RevokeApiKeyDialogProps = {
    apiKey: ApiKeyResponse | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function RevokeApiKeyDialog({
    apiKey,
    open,
    onOpenChange,
}: RevokeApiKeyDialogProps) {
    const revokeKey = useRevokeApiKey()
    const [phrase, setPhrase] = useState("")

    const handleOpenChange = (next: boolean) => {
        if (revokeKey.isPending) return
        if (next) setPhrase("")
        onOpenChange(next)
    }

    if (!apiKey) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent />
            </Dialog>
        )
    }

    const lastUsedText = apiKey.last_used
        ? relativeTimeFrom(apiKey.last_used)
        : "Never"

    const matches = phrase.trim() === apiKey.label.trim()

    const onConfirm = async (e: React.SubmitEvent) => {
        e.preventDefault()
        if (!matches || revokeKey.isPending) return
        try {
            await revokeKey.mutateAsync(apiKey.id)
            toast.success("Key Revoked!")
            onOpenChange(false)
        } catch (err) {
            if (err instanceof ApiError && err.isNotFound) {
                toast.info("Key Already Revoked!")
                onOpenChange(false)
                return
            }
            toast.error(getErrorMessage(err, "Could not revoke key. Try again..."))
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <form
                    onSubmit={onConfirm}
                    className="flex flex-col gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>
                            Revoke "{apiKey.label}"?
                        </DialogTitle>
                        <DialogDescription>
                            Any scripts and/or integrations using this key will stop working
                            immediately. This action cannot be undone. You will need to create a
                            new key to restore access.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-md border border-border/40 bg-muted/20 p-3 text-sm flex flex-col gap-1">
                        <div>
                            <span className="text-muted-foreground">Prefix: </span>
                            <code className="text-xs">{apiKey.prefix}…</code>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Last used: </span>
                            {lastUsedText}
                        </div>
                        {apiKey.last_used_ip && (
                            <div>
                                <span className="text-muted-foreground">From: </span>
                                <code className="text-xs">{apiKey.last_used_ip}</code>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="revoke-confirm-input">
                            Type <strong>{apiKey.label}</strong> to confirm
                        </Label>
                        <Input
                            id="revoke-confirm-input"
                            value={phrase}
                            onChange={(e) => setPhrase(e.target.value)}
                            autoComplete="off"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={revokeKey.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={!matches || revokeKey.isPending}
                        >
                            {revokeKey.isPending ? "Revoking..." : "Revoke key"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
