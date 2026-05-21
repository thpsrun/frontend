import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"

export type RunStatusChoice = "unchanged" | "verified" | "rejected" | "review"

interface Props {
    runStatus: RunStatusChoice
    denyReason: string
    reviewNotes: string
    onRunStatusChange: (v: RunStatusChoice) => void
    onDenyReasonChange: (v: string) => void
    onReviewNotesChange: (v: string) => void
}

export function ModeratorVerdictSection({
    runStatus,
    denyReason,
    reviewNotes,
    onRunStatusChange,
    onDenyReasonChange,
    onReviewNotesChange,
}: Props) {
    return (
        <div className="space-y-1 pt-2">
            <Label className="text-xs">Run Status</Label>
            <Select
                value={runStatus}
                onValueChange={(v) => onRunStatusChange(v as RunStatusChoice)}
            >
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="unchanged">Keep Unverified</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Denied</SelectItem>
                    <SelectItem value="review">Send Back for Review</SelectItem>
                </SelectContent>
            </Select>
            {runStatus === "rejected" && (
                <div className="space-y-1 pt-2">
                    <Label className="text-xs" htmlFor="run-deny-reason">
                        Reason <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="run-deny-reason"
                        value={denyReason}
                        onChange={(e) => onDenyReasonChange(e.target.value)}
                        placeholder="Why is this run being denied?"
                    />
                </div>
            )}
            {runStatus === "review" && (
                <div className="space-y-1 pt-2">
                    <Label className="text-xs" htmlFor="run-review-notes">
                        Notes to Runner <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id="run-review-notes"
                        value={reviewNotes}
                        onChange={(e) => onReviewNotesChange(e.target.value)}
                        placeholder="What does the runner need to fix?"
                        rows={5}
                        maxLength={2000}
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Minimum 5 characters: {reviewNotes.length} / 2000
                    </p>
                </div>
            )}
        </div>
    )
}
