import { Panel } from "@/components/ui/panel"
import { UserSearchCombobox } from "./user-search-combobox"

export function UsersAdminPage() {
    return (
        <div className="space-y-4">
            <Panel>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">User Admin</h2>
                    <p className="text-sm text-muted-foreground">
                        Find a player to manage their moderated games, awards, what profile
                        picture they are using, and their account state (to include banning).
                    </p>
                    <UserSearchCombobox autoFocus />
                </div>
            </Panel>
        </div>
    )
}
