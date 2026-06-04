import { useState } from "react"
import { toast } from "sonner"
import { useResyncProfile } from "@/hooks/auth/useResyncProfile"
import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { SectionPanel } from "@/components/profile/section-panel"
import { ApiError } from "@/lib/api-client"
import { getErrorMessage } from "@/lib/utils"

function resyncErrorMessage(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.isForbidden) {
            return "You need a linked Speedrun.com player to resync."
        }
        if (err.isRateLimited) {
            return "You've hit the resync limit (5 per hour). Try again later."
        }
        if (err.status === 502) {
            return "Couldn't reach Speedrun.com. Try again in a moment."
        }
        if (err.status === 503) {
            return "Speedrun.com is rate-limiting right now. Try again shortly."
        }
    }
    return getErrorMessage(err, "Resync failed.")
}

export function ResyncSection() {
    const resync = useResyncProfile()
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleResync = async () => {
        setErrorMsg(null)
        try {
            await resync.mutateAsync()
            toast.success("Resynced from Speedrun.com!")
        } catch (err) {
            setErrorMsg(resyncErrorMessage(err))
        }
    }

    return (
        <SectionPanel
            title="Resync from Speedrun.com"
            description="Re-pull your username from your linked Speedrun.com account."
        >
            <div className="flex flex-col gap-4">
                <Button
                    variant="outline"
                    onClick={handleResync}
                    disabled={resync.isPending}
                    className="self-start"
                >
                    {resync.isPending
                        ? "Resyncing..."
                        : "Resync from Speedrun.com"}
                </Button>

                {errorMsg && (
                    <AlertBanner variant="error">
                        {errorMsg}
                    </AlertBanner>
                )}
            </div>
        </SectionPanel>
    )
}
