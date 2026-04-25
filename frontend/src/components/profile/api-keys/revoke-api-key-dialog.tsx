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
import { ApiError } from "@/lib/api-client"
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

    const onConfirm = async () => {
        try {
            await revokeKey.mutateAsync(apiKey.id)
            toast.success("Key revoked.")
            onOpenChange(false)
        } catch (err) {
            if (err instanceof ApiError && err.status === 404) {
                toast.info("Key was already revoked.")
                onOpenChange(false)
                return
            }
            toast.error("Could not revoke key. Try again.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Revoke "{apiKey.label}"?
                    </DialogTitle>
                    <DialogDescription>
                        Any scripts and/or integrations using this key will stop working
                        immediately. This action CANNOT be undone - you'll need to create a new
                        key to restor access.
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
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={revokeKey.isPending}
                    >
                        {revokeKey.isPending ? "Revoking..." : "Revoke key"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
