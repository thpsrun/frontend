import { Link } from "react-router"
import {
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell } from "lucide-react"
import { useUnreadCount } from "@/hooks/notifications/useUnreadCount"
import { useNotifications } from "@/hooks/notifications/useNotifications"
import { NotificationItemRow } from "./notification-item-row"

const SUBMENU_LIMIT = 5

interface Props {
    onItemSelected?: () => void
}

export function NotificationsMenu({ onItemSelected }: Props) {
    const unread = useUnreadCount().data?.count ?? 0
    const list = useNotifications({ limit: SUBMENU_LIMIT })
    const items = list.data?.items ?? []

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger chevronSide="left">
                <Bell className="size-4" />
                <span>Notifications</span>
                {unread > 0 && (
                    <span className="ml-1 text-xs font-medium text-muted-foreground">
                        • {unread}
                        <span className="sr-only"> Unread</span>
                    </span>
                )}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
                sideOffset={4}
                className="w-80 max-h-96 overflow-auto p-1"
            >
                {list.isLoading && (
                    <div className="flex flex-col gap-2 p-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="size-4 rounded-full mt-0.5" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3 w-2/3" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {list.isError && !list.isLoading && (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                        Couldn't load notifications...
                    </div>
                )}
                {!list.isLoading && !list.isError && items.length === 0 && (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No notifications yet...
                    </div>
                )}
                {items.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                        {items.map((n) => (
                            <NotificationItemRow
                                key={n.id}
                                notification={n}
                                compact
                                onAfterNavigate={onItemSelected}
                            />
                        ))}
                    </div>
                )}
                <DropdownMenuSeparator />
                <Link
                    to="/notifications"
                    onClick={onItemSelected}
                    className="block rounded-sm px-2 py-1.5 text-center text-xs font-medium text-primary outline-none hover:bg-accent focus:bg-accent"
                >
                    View All
                </Link>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}
