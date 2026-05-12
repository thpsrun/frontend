import { useParams } from "react-router"
import { Panel } from "@/components/ui/panel"
import { usePlayerProfile } from "@/hooks/player/usePlayerProfile"
import { UserSearchCombobox } from "./user-search-combobox"
import { ModeratesSection } from "./sections/moderates-section"
import { AwardsSection } from "./sections/awards-section"
import { PfpSection } from "./sections/pfp-section"
import { AccountSection } from "./sections/account-section"

export function UsersAdminDetailPage() {
    const { ident } = useParams<{ ident: string }>()
    const profile = usePlayerProfile(ident ?? "", { enabled: Boolean(ident) })

    if (!ident) return null

    const player = profile.data?.player
    const displayName = player?.nickname ?? player?.name ?? null

    return (
        <div className="space-y-4">
            <Panel>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">User Admin</h2>
                    <p className="text-sm text-muted-foreground">
                        Managing User
                        <br />
                        Display Name:{" "}
                        {displayName ? (
                            <>
                                <span className="text-foreground">
                                    {displayName}
                                </span>{" "}
                                | Unique ID:  <code className="text-foreground">{ident}</code>
                            </>
                        ) : (
                            <code>{ident}</code>
                        )}
                    </p>
                    <UserSearchCombobox />
                </div>
            </Panel>

            <div className="grid gap-4 lg:grid-cols-2">
                <ModeratesSection ident={ident} />
                <AwardsSection ident={ident} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <PfpSection ident={ident} />
                <AccountSection ident={ident} />
            </div>
        </div>
    )
}
