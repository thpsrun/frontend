import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertBanner } from "@/components/ui/alert-banner"
import { useSubmissions } from "@/hooks/submissions/useSubmissions"
import { Loader2 } from "lucide-react"
import type { PendingRun } from "@/types/submissions"

export function VerifyDialog({
    run,
    open,
    onOpenChange,
    defaultAction = "verified",
}: {
    run: PendingRun
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultAction?: "verified" | "rejected"
}) {
    const { verifyReject } = useSubmissions()
    const [action, setAction] = useState<"verified" | "rejected">(
        defaultAction,
    )
    const [reason, setReason] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleOpenChange = (next: boolean) => {
        if (next) {
            setAction(defaultAction)
            setReason("")
            setError(null)
        }
        onOpenChange(next)
    }

    const playerNames = run.players.map((p) => p.name).join(", ")
    const levelLabel = run.level
        ? `${run.category.name} - ${run.level.name}`
        : run.category.name

    const handleSubmit = () => {
        setError(null)
        verifyReject.mutate(
            {
                runId: run.id,
                data: {
                    status: action,
                    ...(action === "rejected" ? { reason } : {}),
                },
            },
            {
                onSuccess: () => handleOpenChange(false),
                onError: (err) => setError(err.message),
            },
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Review Run</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 text-sm">
                    <div>
                        <span className="text-muted-foreground">Runner:</span>{" "}
                        {playerNames}
                    </div>
                    <div>
                        <span className="text-muted-foreground">Category:</span>{" "}
                        {levelLabel}
                    </div>
                    <div>
                        <span className="text-muted-foreground">Time:</span>{" "}
                        <span className="font-mono">{run.times.p_time}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            size="sm"
                            variant={action === "verified" ? "default" : "outline"}
                            onClick={() => setAction("verified")}
                        >
                            Verify
                        </Button>
                        <Button
                            size="sm"
                            variant={action === "rejected" ? "destructive" : "outline"}
                            onClick={() => setAction("rejected")}
                        >
                            Reject
                        </Button>
                    </div>

                    {action === "rejected" && (
                        <div className="space-y-1.5">
                            <Label htmlFor="reject-reason">Reason (required)</Label>
                            <Input
                                id="reject-reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why is this run being rejected?"
                            />
                        </div>
                    )}

                    {error && (
                        <AlertBanner variant="error">{error}</AlertBanner>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            verifyReject.isPending ||
                            (action === "rejected" && !reason.trim())
                        }
                    >
                        {verifyReject.isPending && (
                            <Loader2 className="size-4 animate-spin mr-1" />
                        )}
                        {action === "verified" ? "Verify Run" : "Reject Run"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
