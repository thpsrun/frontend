import { useEffect } from "react"
import { useDeactivateTotp } from "@/hooks/auth/useTotp"
import { useReauthGuard } from "@/hooks/auth/useReauthGuard"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReauthStep } from "@/components/auth/reauth-step"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function RemoveTotpDialog({ open, onOpenChange }: Props) {
    const remove = useDeactivateTotp()
    const { reauthNeeded, error, runGuarded, onReauthed, reset } =
        useReauthGuard()

    const close = () => onOpenChange(false)

    useEffect(() => {
        if (open) return
        reset()
    }, [open, reset])

    const attemptRemove = () => {
        void runGuarded(async () => {
            await remove.mutateAsync()
            close()
        }, "Couldn't remove the authenticator app. Please try again.")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {reauthNeeded ? (
                    <ReauthStep onSuccess={onReauthed} onCancel={close} />
                ) : (
                    <div className="flex flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle>Remove Authenticator App</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            This turns off one-time passwords on your account! If you proceed and
                            you are a moderator, you will be asked to re-add a 2FA method or Passkey.
                        </p>
                        {error && (
                            <div className="text-sm text-destructive">{error}</div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={close}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={remove.isPending}
                                onClick={attemptRemove}
                            >
                                {remove.isPending ? "Removing..." : "Remove"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
