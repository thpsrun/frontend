import { useState } from "react"
import { useEmailStatus } from "@/hooks/auth/useEmailStatus"
import { EmailChangeDialog } from "@/components/profile/email-change-dialog"
import { EmailPendingBanner } from "@/components/profile/email-pending-banner"
import { SectionPanel } from "@/components/profile/section-panel"
import { Button } from "@/components/ui/button"

export function EmailSection() {
    const { data, isLoading, isError } = useEmailStatus()
    const [open, setOpen] = useState(false)

    if (isLoading) {
        return (
            <SectionPanel title="Email">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </SectionPanel>
        )
    }

    if (isError || !data) {
        return (
            <SectionPanel title="Email">
                <p className="text-sm text-destructive">
                    We couldn't load your email settings. Refresh to try again.
                </p>
            </SectionPanel>
        )
    }

    return (
        <SectionPanel title="Email">
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm">{data.email}</span>
                    {data.verified ? (
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                            Verified
                        </span>
                    ) : (
                        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                            Unverified
                        </span>
                    )}
                </div>
                <div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(true)}
                        disabled={!!data.pending_email}
                    >
                        Change email
                    </Button>
                </div>
                {data.pending_email && (
                    <EmailPendingBanner pendingEmail={data.pending_email} />
                )}
                <EmailChangeDialog open={open} onOpenChange={setOpen} />
            </div>
        </SectionPanel>
    )
}
