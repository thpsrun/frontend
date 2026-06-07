import { AlertTriangle } from "lucide-react"

import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import {
    formatTimingMethods,
    type UnresolvedIssues,
} from "@/components/submissions/import-issues"

interface ImportIssuesBannerProps {
    unresolved: UnresolvedIssues
    onSendBack: () => void
    isModerator: boolean
}

export function ImportIssuesBanner({
    unresolved,
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

            {hasTiming && (
                <p>
                    This run can't be approved while a required timing method
                    is missing. Enter it in the Timing section below, or send it
                    back to the runner to fix.
                </p>
            )}

            {isModerator && (
                <Button
                    type="button"
                    size="sm"
                    onClick={onSendBack}
                >
                    Send Back to Runner
                </Button>
            )}
        </AlertBanner>
    )
}
