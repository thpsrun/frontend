import { AlertTriangle } from "lucide-react"

import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    formatTimingMethods,
    type UnresolvedIssues,
} from "@/components/submissions/import-issues"

interface ImportIssuesBannerProps {
    unresolved: UnresolvedIssues
    videoAcknowledged: boolean
    onVideoAcknowledgedChange: (value: boolean) => void
    onSendBack: () => void
    isModerator: boolean
}

export function ImportIssuesBanner({
    unresolved,
    videoAcknowledged,
    onVideoAcknowledgedChange,
    onSendBack,
    isModerator,
}: ImportIssuesBannerProps) {
    const hasVideo = unresolved.video !== null
    const hasTiming = unresolved.missingTimingMethods.length > 0

    if (!hasVideo && !hasTiming) return null

    return (
        <AlertBanner variant="error" className="mt-4 space-y-3">
            <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="size-4 shrink-0" />
                This run has import issues:
            </div>
            <ul className="list-disc space-y-1 pl-5">
                {hasVideo && <li>Video is Not a YouTube Link.</li>}
                {hasTiming && (
                    <li>
                        Missing Required Timing:{" "}
                        {formatTimingMethods(unresolved.missingTimingMethods)}.
                    </li>
                )}
            </ul>

            {hasVideo && (
                <Label className="flex items-start gap-2 font-normal cursor-pointer">
                    <Checkbox
                        checked={videoAcknowledged}
                        onCheckedChange={(v) =>
                            onVideoAcknowledgedChange(v === true)
                        }
                        className="mt-0.5"
                    />
                    <span>
                        I confirm and understand this video issue and want to
                        save the run anyway.
                    </span>
                </Label>
            )}

            {hasTiming && isModerator && (
                <div className="space-y-2">
                    <p>
                        This run cannot be saved while a required timing method
                        is missing. Send it back to the runner to fix.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onSendBack}
                    >
                        Send Back to Runner
                    </Button>
                </div>
            )}
        </AlertBanner>
    )
}
