import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { MessageSquareWarning, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useResubmitRun } from "@/hooks/submissions/useResubmitRun"
import { ApiError } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

interface Props {
    notes: string
    canResubmit: boolean
    runId: string
}

export function ReviewNotesBanner({ notes, canResubmit, runId }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false)
    const resubmit = useResubmitRun()
    const queryClient = useQueryClient()

    const handleResubmit = async () => {
        try {
            await resubmit.mutateAsync({ runId })
            toast.success("Run Resubmitted!")
            setConfirmOpen(false)
        } catch (err) {
            if (err instanceof ApiError) {
                queryClient.invalidateQueries({ queryKey: queryKeys.submissions.all })
                if (err.isForbidden) {
                    toast.error("You can only resubmit your own runs!")
                    return
                }
                if (err.isNotFound) {
                    toast.error("Run not found.")
                    setConfirmOpen(false)
                    return
                }
                if (err.isConflict) {
                    toast.error("This run is no longer in review state..")
                    setConfirmOpen(false)
                    return
                }
            }
            toast.error(err instanceof Error ? err.message : "Could not resubmit run...")
        }
    }

    return (
        <div
            role="status"
            className={cn(
                "rounded-md border p-3 text-sm space-y-2",
                "bg-amber-500/5 border-amber-500/20",
            )}
        >
            <div className="flex items-center gap-2 text-amber-300 font-medium">
                <MessageSquareWarning className="size-4 shrink-0" />
                <span>Moderator notes</span>
            </div>
            <p className="whitespace-pre-wrap text-foreground/90">
                {notes}
            </p>
            {canResubmit && (
                <div className="pt-1">
                    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <AlertDialogTrigger asChild>
                            <Button size="sm">
                                Resubmit to Moderators
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Resubmit this run?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    A moderator will review it again. The notes above will stay attached for context.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    disabled={resubmit.isPending}
                                >
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.preventDefault()
                                        void handleResubmit()
                                    }}
                                    disabled={resubmit.isPending}
                                >
                                    {resubmit.isPending && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    Resubmit
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    )
}
