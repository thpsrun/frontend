import { AlertTriangle } from "lucide-react"
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
import type { ReactNode } from "react"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    summary: ReactNode
    sourceLabel: string
    targetLabel: string
    isPending: boolean
    onConfirm: () => void
}

export function ConfirmStartReconcileDialog({
    open,
    onOpenChange,
    summary,
    sourceLabel,
    targetLabel,
    isPending,
    onConfirm,
}: Props) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={(next) => {
                if (!isPending) onOpenChange(next)
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-amber-400" />
                        Confirm Reconciliation
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Review the details below before queueing this job.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3 text-sm">
                    <div className="rounded-md border border-border/40 bg-muted/20 p-3 text-foreground">
                        {summary}
                    </div>
                    <p className="text-foreground">
                        <span className="font-semibold">{sourceLabel}</span>
                        {" is the source of truth. Any differing data on "}
                        <span className="font-semibold">{targetLabel}</span>
                        {" will be overwritten to match."}
                    </p>
                    <p className="text-muted-foreground">
                        The job runs in the background. You can monitor or cancel it from the jobs list.
                    </p>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Back
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isPending}
                        onClick={(e) => {
                            e.preventDefault()
                            onConfirm()
                        }}
                    >
                        {isPending ? "Queueing..." : "Confirm and Start"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
