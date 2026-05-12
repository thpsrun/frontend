import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import {
    useBanUser,
    useForcePasswordReset,
    useRevokeSessions,
    useUnbanUser,
} from "@/hooks/admin/useAdminUsers"

interface ConfirmActionProps {
    label: string
    title: string
    description: string
    confirmLabel: string
    danger?: boolean
    pending?: boolean
    onConfirm: () => void
}

function ConfirmAction({
    label,
    title,
    description,
    confirmLabel,
    danger,
    pending,
    onConfirm,
}: ConfirmActionProps) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button
                variant={danger ? "destructive" : "outline"}
                disabled={pending}
                onClick={() => setOpen(true)}
            >
                {pending ? "Working..." : label}
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setOpen(false)
                                onConfirm()
                            }}
                        >
                            {confirmLabel}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

interface AccountSectionProps {
    ident: string
}

export function AccountSection({ ident }: AccountSectionProps) {
    const revoke = useRevokeSessions(ident)
    const reset = useForcePasswordReset(ident)
    const ban = useBanUser(ident)
    const unban = useUnbanUser(ident)

    return (
        <Panel className="p-5 w-full">
            <div className="mb-3">
                <h3 className="text-lg font-semibold">Account</h3>
            </div>

            <div className="flex flex-wrap gap-3">
                <ConfirmAction
                    label="Revoke All Sessions"
                    title="Revoke All Sessions?"
                    description="This logs the user out of every active session. They will be logged out within 30 seconds or upon re-validating their session (whichever is first)."
                    confirmLabel="Revoke"
                    pending={revoke.isPending}
                    onConfirm={() => revoke.mutate()}
                />

                <ConfirmAction
                    label="Force Password Reset"
                    title="Force Password Reset?"
                    description="The user will be prompted to set a new password. Their session will be invalidated."
                    confirmLabel="Force reset"
                    pending={reset.isPending}
                    onConfirm={() => reset.mutate()}
                />

                <ConfirmAction
                    label="Ban User"
                    title="Ban This User?"
                    description="Bans the user from logging in."
                    confirmLabel="Ban"
                    danger
                    pending={ban.isPending}
                    onConfirm={() => ban.mutate()}
                />

                <ConfirmAction
                    label="Unban User"
                    title="Unban This User?"
                    description="Restores the user's ability to log in."
                    confirmLabel="Unban"
                    pending={unban.isPending}
                    onConfirm={() => unban.mutate()}
                />
            </div>
        </Panel>
    )
}
