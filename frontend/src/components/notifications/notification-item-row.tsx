import { useState, type MouseEvent } from "react"
import { useNavigate } from "react-router"
import { Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { cn, getErrorMessage } from "@/lib/utils"
import { destinationFor, formatRelativeShort, subtitleFor } from "@/lib/notifications"
import { NotificationIcon } from "./notification-icon"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
    useMarkRead,
    useDeleteNotification,
} from "@/hooks/notifications/useNotificationMutations"
import type { Notification } from "@/types/notifications"

interface Props {
    notification: Notification
    compact?: boolean
    onAfterNavigate?: () => void
}

export function NotificationItemRow({
    notification,
    compact = false,
    onAfterNavigate,
}: Props) {
    const navigate = useNavigate()
    const markRead = useMarkRead()
    const remove = useDeleteNotification()
    const [menuOpen, setMenuOpen] = useState(false)

    const subtitle = subtitleFor(notification)
    const destination = destinationFor(notification)
    const relative = formatRelativeShort(notification.created_at)

    const handleClick = () => {
        if (!notification.is_read) {
            markRead.mutate(notification.id)
        }
        if (destination) {
            navigate(destination)
            onAfterNavigate?.()
        }
    }

    const handleDelete = (e: MouseEvent) => {
        e.stopPropagation()
        remove.mutate(
            { id: notification.id, wasUnread: !notification.is_read },
            {
                onError: (err) => {
                    toast.error(
                        getErrorMessage(err, "Could not delete notification."),
                    )
                },
            },
        )
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleClick()
                }
            }}
            className={cn(
                "group relative flex w-full cursor-pointer items-start gap-3",
                "rounded-sm px-2 py-2 outline-none transition-colors",
                "focus:bg-accent hover:bg-accent",
                !notification.is_read && "bg-accent/30",
            )}
            aria-label={`${notification.title}. ${subtitle}. ${relative}.${
                notification.is_read ? "" : " Unread."
            }`}
        >
            <NotificationIcon
                kind={notification.type}
                size={compact ? "sm" : "md"}
                className="mt-0.5 shrink-0"
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <span
                        className={cn(
                            "truncate text-sm",
                            !notification.is_read
                                ? "font-semibold text-foreground"
                                : "text-foreground/80",
                        )}
                    >
                        {notification.title}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {relative}
                    </span>
                </div>
                <p
                    className={cn(
                        "text-xs text-muted-foreground",
                        compact ? "truncate" : "line-clamp-2",
                    )}
                >
                    {subtitle}
                </p>
            </div>

            {!compact && (
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "shrink-0 rounded-sm p-1 text-muted-foreground",
                                "opacity-0 transition-opacity",
                                "group-hover:opacity-100 group-focus-within:opacity-100",
                                "focus-visible:opacity-100",
                                "hover:bg-muted hover:text-foreground",
                                menuOpen && "opacity-100",
                            )}
                            aria-label="Notification actions"
                        >
                            <MoreHorizontal className="size-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault()
                            }}
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}
