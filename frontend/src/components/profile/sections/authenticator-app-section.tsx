import { useState } from "react"
import { Smartphone } from "lucide-react"
import { useAuthenticators } from "@/hooks/auth/useAuthenticators"
import { EmptyState } from "@/components/common/empty-state"
import { SectionPanel } from "@/components/profile/section-panel"
import { Button } from "@/components/ui/button"
import { ROW_CLASS, formatAddedAt } from "./settings-row"
import { EnrollTotpDialog } from "./enroll-totp-dialog"
import { RemoveTotpDialog } from "./remove-totp-dialog"
import { RecoveryCodesRevealDialog } from "./recovery-codes-reveal-dialog"

export function AuthenticatorAppSection() {
    const { data: authenticators } = useAuthenticators()
    const totp = (authenticators ?? []).find((a) => a.type === "totp") ?? null

    const [enrollOpen, setEnrollOpen] = useState(false)
    const [removeOpen, setRemoveOpen] = useState(false)
    const [revealOpen, setRevealOpen] = useState(false)

    return (
        <SectionPanel
            title="Authenticator app"
            description="Use a TOTP app (Google Authenticator, 1Password, Authy, Bitwarden) for 2FA sign-in."
        >
            <div className="flex flex-col gap-3">
                {totp ? (
                    <>
                        <div className={ROW_CLASS}>
                            <div>
                                <div className="text-sm font-medium">
                                    Authenticator App
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Added {formatAddedAt(totp.created_at)}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRemoveOpen(true)}
                            >
                                Remove
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            className="self-start"
                            onClick={() => setRevealOpen(true)}
                        >
                            Regenerate Recovery Codes
                        </Button>
                    </>
                ) : (
                    <>
                        <EmptyState
                            inset
                            icon={Smartphone}
                            title="Not Set Up"
                        />
                        <Button
                            variant="outline"
                            className="self-start"
                            onClick={() => setEnrollOpen(true)}
                        >
                            Set up
                        </Button>
                    </>
                )}
            </div>
            <EnrollTotpDialog open={enrollOpen} onOpenChange={setEnrollOpen} />
            <RemoveTotpDialog open={removeOpen} onOpenChange={setRemoveOpen} />
            <RecoveryCodesRevealDialog
                open={revealOpen}
                onOpenChange={setRevealOpen}
            />
        </SectionPanel>
    )
}
