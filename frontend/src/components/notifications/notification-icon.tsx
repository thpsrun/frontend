import { cn } from "@/lib/utils"
import { iconFor } from "@/lib/notifications"
import type { NotificationKind } from "@/types/notifications"

interface Props {
    kind: NotificationKind
    className?: string
    size?: "sm" | "md"
}

export function NotificationIcon({ kind, className, size = "md" }: Props) {
    const { Icon, className: kindClass } = iconFor(kind)
    return (
        <Icon
            className={cn(
                size === "sm" ? "size-4" : "size-5",
                kindClass,
                className,
            )}
            aria-hidden
        />
    )
}
