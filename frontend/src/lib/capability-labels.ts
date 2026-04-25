export const CAPABILITY_LABELS: Record<string, string> = {
    "runs.submit": "Submit Runs",
    "runs.edit_own": "Edit Own Runs",
    "runs.edit_any": "Edit Any Run",
    "runs.verify": "Verify Runs",
    "runs.delete": "Delete Runs",
    "guides.create": "Create Guides",
    "guides.edit_own": "Edit Own Guides",
    "guides.edit_any": "Edit Any Guide",
    "guides.delete_own": "Delete Own Guides",
    "guides.delete_any": "Delete Any Guide",
    "games.manage": "Manage Games",
    "api_keys.create_own": "Create Own API Keys",
    "api_keys.list_own": "List Own API Keys",
    "api_keys.revoke_own": "Revoke Own API Keys",
    "api_keys.admin": "Administer API Keys",
    "users.admin": "Administer Users",
    "users.view_private": "View Private User Info",
    "profile.edit_own": "Edit Own Profile",
    "submissions.list_own": "List Own Submissions",
    "sync_logs.admin": "Administer Sync Logs",
}

export const GAME_SCOPED_CAPS = new Set<string>([
    "runs.submit",
    "runs.edit_own",
    "runs.edit_any",
    "runs.verify",
    "runs.delete",
    "guides.create",
    "guides.edit_own",
    "guides.edit_any",
    "guides.delete_own",
    "guides.delete_any",
    "games.manage",
])

export function capabilityLabel(raw: string): string {
    return CAPABILITY_LABELS[raw] ?? raw
}
