import {
    Bell,
    Check,
    KeyRound,
    MessageSquareWarning,
    ShieldCheck,
    X,
    type LucideIcon,
} from "lucide-react"

import type {
    ApiKeyExpiringPayload,
    ModPromotedPayload,
    Notification,
    NotificationKind,
    RunPayload,
} from "@/types/notifications"

interface KindIcon {
    Icon: LucideIcon
    className: string
}

const KIND_ICON: Record<string, KindIcon> = {
    run_approved:     { Icon: Check,                 className: "text-green-500"        },
    run_denied:       { Icon: X,                     className: "text-red-500"          },
    run_review:       { Icon: MessageSquareWarning,  className: "text-amber-500"        },
    mod_promoted:     { Icon: ShieldCheck,           className: "text-blue-500"         },
    api_key_expiring: { Icon: KeyRound,              className: "text-amber-500"        },
}

const FALLBACK_ICON: KindIcon = {
    Icon: Bell,
    className: "text-muted-foreground",
}

export function iconFor(kind: NotificationKind): KindIcon {
    return KIND_ICON[kind] ?? FALLBACK_ICON
}

export function destinationFor(n: Notification): string | null {
    switch (n.type) {
        case "run_approved": {
            const p = n.payload as RunPayload
            return p.game_id ? `/${p.game_id}` : null
        }
        case "run_denied":
        case "run_review":
            return "/submissions"
        case "mod_promoted": {
            const p = n.payload as ModPromotedPayload
            return p.game_id ? `/${p.game_id}/manage` : null
        }
        case "api_key_expiring":
            return "/profile/settings/api-keys"
        default:
            return null
    }
}

export function subtitleFor(n: Notification): string {
    switch (n.type) {
        case "run_approved":
        case "run_denied":
        case "run_review": {
            const p = n.payload as RunPayload
            if (p.game_name && p.category_name) {
                return `${p.game_name} - ${p.category_name}`
            }
            return n.body
        }
        case "mod_promoted": {
            const p = n.payload as ModPromotedPayload
            if (p.game_name) {
                return `${p.game_name}`
            }
            return n.body
        }
        case "api_key_expiring": {
            const p = n.payload as ApiKeyExpiringPayload
            if (p.key_label && typeof p.days_until_expiry === "number") {
                return `${p.key_label} expires in ${p.days_until_expiry} days.`
            }
            return n.body
        }
        default:
            return n.body
    }
}

const RTF = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
const DTF = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })

// Compact relative-time formatter for notification rows.
export function formatRelativeShort(iso: string): string {
    const ts = Date.parse(iso)
    if (Number.isNaN(ts)) return ""
    const diffMs = ts - Date.now()
    const absSec = Math.abs(diffMs) / 1000

    if (absSec < 45) return "now"
    if (absSec < 3600) return `${Math.round(absSec / 60)}m`
    if (absSec < 86_400) return `${Math.round(absSec / 3600)}h`
    if (absSec < 7 * 86_400) return `${Math.round(absSec / 86_400)}d`
    return DTF.format(new Date(ts))
}

// Verbose relative-time for accessibility / page rows.
// Examples: "2 hours ago", "in 3 days".
export function formatRelativeVerbose(iso: string): string {
    const ts = Date.parse(iso)
    if (Number.isNaN(ts)) return ""
    const diffSec = (ts - Date.now()) / 1000
    const abs = Math.abs(diffSec)

    if (abs < 60) return RTF.format(Math.round(diffSec), "second")
    if (abs < 3600) return RTF.format(Math.round(diffSec / 60), "minute")
    if (abs < 86_400) return RTF.format(Math.round(diffSec / 3600), "hour")
    if (abs < 7 * 86_400) return RTF.format(Math.round(diffSec / 86_400), "day")
    if (abs < 30 * 86_400) return RTF.format(Math.round(diffSec / (7 * 86_400)), "week")
    if (abs < 365 * 86_400) return RTF.format(Math.round(diffSec / (30 * 86_400)), "month")
    return RTF.format(Math.round(diffSec / (365 * 86_400)), "year")
}
