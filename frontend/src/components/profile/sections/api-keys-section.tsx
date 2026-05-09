import { useMemo, useState } from "react"
import { Link } from "react-router"
import { Plus, KeyRound } from "lucide-react"
import { API_BASE_URL } from "@/constants"
import { Button } from "@/components/ui/button"
import { AlertBanner } from "@/components/ui/alert-banner"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionPanel } from "@/components/profile/section-panel"
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

    const description = (
        <>
            <p className="max-w-xl">
                thps.run keys allow you to access the website's API on your behalf.
                They can be used to create bots or programs or scripts. Up to 10 active
                keys can be created per account, with a maximum time of 365 days.
            </p>
            <p className="max-w-xl mt-2 text-red-500">
                WARNING!! Anyone with these API keys can act on your behalf, INCLUDING bad actors.
                Always make sure your keys are secured, never give them to anyone, and definitely
                never release them onto the public Internet and/or chat!!
            </p>
            <p className="max-w-xl mt-2">
                <Link
                    to={`${API_BASE_URL}/docs`}
                    target="_blank"
                    className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                    thps.run API Documentation
                </Link>
            </p>
        </>
    )

    return (
        <div className="flex flex-col gap-6">
            <SectionPanel title="API Keys" description={description}>
                <div className="flex flex-col gap-4">
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="self-start"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Create New Key
                    </Button>

                    {keysQuery.isLoading && (
                        <div className="text-sm text-muted-foreground py-4">
                            Loading Keys...
                        </div>
                    )}

                    {keysQuery.isError && (
                        <AlertBanner variant="error">
                            Could not load API keys. Refresh the page to try again.
                        </AlertBanner>
                    )}

                    {!keysQuery.isLoading && !keysQuery.isError && active.length === 0 && (
                        <EmptyState
                            inset
                            icon={KeyRound}
                            title="No thps.run API Keys Yet"
                        />
                    )}

                    {active.length > 0 && (
                        <ApiKeysTable
                            keys={active}
                            onEdit={setEditing}
                            onRevoke={setRevoking}
                        />
                    )}
                </div>
            </SectionPanel>

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
