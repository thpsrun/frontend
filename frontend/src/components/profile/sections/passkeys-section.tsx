import { useState } from "react"
import { Fingerprint } from "lucide-react"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import { useAuthenticators } from "@/hooks/auth/useAuthenticators"
import { useEnrollPasskey } from "@/hooks/auth/useEnrollPasskey"
import { useDeletePasskey } from "@/hooks/auth/useDeletePasskey"
import { canRemovePasskey } from "@/lib/auth-methods"
import type { Authenticator } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"
import { SectionPanel } from "@/components/profile/section-panel"
import { cn } from "@/lib/utils"
import { EnrollPasskeyDialog } from "./enroll-passkey-dialog"
import { RemovePasskeyDialog } from "./remove-passkey-dialog"

const ROW_CLASS = cn(
    "flex items-center",
    "justify-between",
    "rounded-md",
    "border border-border/40",
    "px-4 py-3",
)

function formatAddedAt(epochSeconds: number): string {
    return new Date(epochSeconds * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export function PasskeysSection() {
    const { data: methods } = useAuthMethods()
    const { data: authenticators } = useAuthenticators()
    const passkeys = (authenticators ?? []).filter(
        (a): a is Authenticator => a.type === "webauthn",
    )
    const enroll = useEnrollPasskey()
    const remove = useDeletePasskey()
    const [enrollOpen, setEnrollOpen] = useState(false)
    const [removing, setRemoving] = useState<Authenticator | null>(null)

    const handleEnroll = (name: string, password: string) => {
        enroll.mutate({ name, password }, {
            onSuccess: () => setEnrollOpen(false),
        })
    }

    const handleRemove = (password: string) => {
        if (!removing) return
        remove.mutate({ id: removing.id, password }, {
            onSuccess: () => setRemoving(null),
        })
    }

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
                                    disabled={remove.isPending || !canRemoveThis}
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
                onConfirm={handleEnroll}
                isPending={enroll.isPending}
            />
            <RemovePasskeyDialog
                open={removing !== null}
                onOpenChange={(open) => {
                    if (!open) setRemoving(null)
                }}
                onConfirm={handleRemove}
                isPending={remove.isPending}
                passkeyName={removing?.name ?? "Passkey"}
            />
        </SectionPanel>
    )
}
