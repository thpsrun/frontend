import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Disconnect {providerLabel}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    You won't be able to sign in with{" "}
                    <span className="font-medium">{providerLabel}</span> anymore.
                </p>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isPending}
                        onClick={onConfirm}
                    >
                        {isPending ? "Disconnecting..." : "Disconnect"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
