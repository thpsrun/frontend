import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Panel } from "@/components/ui/panel"
import { Button } from "@/components/ui/button"
import { AlertBanner } from "@/components/ui/alert-banner"
import { cn } from "@/lib/utils"
import { useApiKeys } from "@/hooks/auth/useApiKeys"
import { ApiKeysTable } from "@/components/profile/api-keys/api-keys-table"
import { RevokedKeysAccordion } from "@/components/profile/api-keys/revoked-keys-accordion"
import { CreateApiKeyDialog } from "@/components/profile/api-keys/create-api-key-dialog"
import { EditApiKeyDialog } from "@/components/profile/api-keys/edit-api-key-dialog"
import { RevokeApiKeyDialog } from "@/components/profile/api-keys/revoke-api-key-dialog"
import type { ApiKeyResponse } from "@/types/api-keys"

export function ApiKeysSection() {
    const keysQuery = useApiKeys()
    const [createOpen, setCreateOpen] = useState(false)
    const [editing, setEditing] = useState<ApiKeyResponse | null>(null)
    const [revoking, setRevoking] = useState<ApiKeyResponse | null>(null)

    const { active, revoked } = useMemo(() => {
        const keys = keysQuery.data ?? []
        return {
            active: keys.filter((k) => !k.revoked),
            revoked: keys.filter((k) => k.revoked),
        }
    }, [keysQuery.data])

    return (
        <div className="flex flex-col gap-6">
            <Panel className="p-5">
                <div className={cn(
                    "flex flex-col sm:flex-row sm:items-start sm:justify-between",
                    "gap-3 mb-4",
                )}>
                    <div>
                        <h2 className="text-xl font-semibold">API Keys</h2>
                        <p className="text-sm text-muted-foreground max-w-xl mt-1">
                            thps.run keys allow you to access the website's API on your behalf.
                            They can be used to create bots or programs or scripts. Up to 10 active
                            keys can be created per account, with a maximum time of 365 days.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create new key
                    </Button>
                </div>

                {keysQuery.isLoading && (
                    <div className="text-sm text-muted-foreground py-4">
                        Loading your keys...
                    </div>
                )}

                {keysQuery.isError && (
                    <AlertBanner variant="error">
                        Could not load API keys. Refresh the page to try again.
                    </AlertBanner>
                )}

                {!keysQuery.isLoading && !keysQuery.isError && active.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            You don't have any API keys yet.
                        </p>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Create your first key
                        </Button>
                    </div>
                )}

                {active.length > 0 && (
                    <ApiKeysTable
                        keys={active}
                        onEdit={setEditing}
                        onRevoke={setRevoking}
                    />
                )}
            </Panel>

            <RevokedKeysAccordion keys={revoked} />

            <CreateApiKeyDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
            />
            <EditApiKeyDialog
                apiKey={editing}
                open={editing !== null}
                onOpenChange={(open) => { if (!open) setEditing(null) }}
            />
            <RevokeApiKeyDialog
                apiKey={revoking}
                open={revoking !== null}
                onOpenChange={(open) => { if (!open) setRevoking(null) }}
            />
        </div>
    )
}
