import { Badge } from "@/components/ui/badge"
import type { ApiKeyResponse } from "@/types/api-keys"

type ReasonConfig = {
    label: string
    text: string
    variant: "secondary" | "destructive" | "warning"
}

const REASON_CONFIG: Record<
    Exclude<ApiKeyResponse["revoked_reason"], "">,
    ReasonConfig
> = {
    user: {
        label: "Revoked by you",
        text: "",
        variant: "secondary",
    },
    admin: {
        label: "Admin",
        text: "Revoked by an administrator.",
        variant: "destructive",
    },
    permission_revoked: {
        label: "Auto-revoked",
        text: "You no longer have the permissions this key was scoped to.",
        variant: "warning",
    },
}

type RevokedReasonCellProps = {
    reason: ApiKeyResponse["revoked_reason"]
}

export function RevokedReasonCell({ reason }: RevokedReasonCellProps) {
    if (reason === "") {
        return <span className="text-muted-foreground text-sm">Unknown</span>
    }
    const config = REASON_CONFIG[reason]
    return (
        <div className="flex flex-col gap-1">
            <Badge variant={config.variant}>{config.label}</Badge>
            <span className="text-xs text-muted-foreground">{config.text}</span>
        </div>
    )
}
