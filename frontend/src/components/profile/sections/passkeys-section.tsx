import { useState } from "react"
import { Fingerprint } from "lucide-react"
import { usePasskeys } from "@/hooks/auth/usePasskeys"
import { useEnrollPasskey } from "@/hooks/auth/useEnrollPasskey"
import { useDeletePasskey } from "@/hooks/auth/useDeletePasskey"
import type { Authenticator } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
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

function formatDate(epochSeconds: number): string {
    return new Date(epochSeconds * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export function PasskeysSection() {
    const { data: passkeys = [] } = usePasskeys()
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
                {passkeys.map((pk) => (
                    <div key={pk.id} className={ROW_CLASS}>
                        <div>
                            <div className="text-sm font-medium">{pk.name}</div>
                            <div className="text-xs text-muted-foreground">
                                Added {formatDate(pk.created_at)}
                                {pk.last_used_at &&
                                    ` (last used ${formatDate(pk.last_used_at)})`}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={remove.isPending}
                            onClick={() => setRemoving(pk)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
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
                passkeyName={removing?.name ?? ""}
            />
        </SectionPanel>
    )
}
