import { useState } from "react"
import { Fingerprint } from "lucide-react"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import { useAuthenticators } from "@/hooks/auth/useAuthenticators"
import { canRemovePasskey } from "@/lib/auth-methods"
import type { Authenticator } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"
import { SectionPanel } from "@/components/profile/section-panel"
import { EnrollPasskeyDialog } from "./enroll-passkey-dialog"
import { RemovePasskeyDialog } from "./remove-passkey-dialog"
import { ROW_CLASS, formatAddedAt } from "./settings-row"

export function PasskeysSection() {
    const { data: methods } = useAuthMethods()
    const { data: authenticators } = useAuthenticators()
    const passkeys = (authenticators ?? []).filter(
        (a): a is Authenticator => a.type === "webauthn",
    )
    const [enrollOpen, setEnrollOpen] = useState(false)
    const [removing, setRemoving] = useState<Authenticator | null>(null)

    return (
        <SectionPanel
            title="Passkeys"
            description="Sign into your thps.run account with Passkeys!"
        >
            <div className="flex flex-col gap-3">
                {passkeys.length === 0 && (
                    <EmptyState
                        inset
                        icon={Fingerprint}
                        title="No Passkeys Enrolled"
                        description="Add one to sign in without your password!"
                    />
                )}
                {passkeys.map((pk) => {
                    const canRemoveThis = methods
                        ? canRemovePasskey(methods, passkeys, pk.id)
                        : false
                    return (
                        <div key={pk.id} className="flex flex-col gap-1">
                            <div className={ROW_CLASS}>
                                <div>
                                    <div className="text-sm font-medium">
                                        {pk.name ?? "Passkey"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Added {formatAddedAt(pk.created_at)}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!canRemoveThis}
                                    onClick={() => setRemoving(pk)}
                                >
                                    Remove
                                </Button>
                            </div>
                            {!canRemoveThis && (
                                <p className="px-1 text-xs text-muted-foreground">
                                    Add another sign-in method first.
                                </p>
                            )}
                        </div>
                    )
                })}
                <Button
                    variant="outline"
                    onClick={() => setEnrollOpen(true)}
                    className="self-start"
                >
                    Add a passkey
                </Button>
            </div>
            <EnrollPasskeyDialog
                open={enrollOpen}
                onOpenChange={setEnrollOpen}
            />
            <RemovePasskeyDialog
                target={removing
                    ? { id: removing.id, name: removing.name ?? "Passkey" }
                    : null}
                onClose={() => setRemoving(null)}
            />
        </SectionPanel>
    )
}
