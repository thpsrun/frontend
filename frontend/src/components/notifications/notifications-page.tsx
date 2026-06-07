import { useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { Bell, Cog } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Panel } from "@/components/ui/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { AlertBanner } from "@/components/common/alert-banner"
import { PageShell } from "@/components/common/page-shell"
import { Pagination } from "@/components/ui/pagination"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn, getErrorMessage } from "@/lib/utils"

import { useNotifications } from "@/hooks/notifications/useNotifications"
import { useUnreadCount } from "@/hooks/notifications/useUnreadCount"
import { useNotificationKinds } from "@/hooks/notifications/useNotificationPrefs"
import { useMarkAllRead } from "@/hooks/notifications/useNotificationMutations"
import { NotificationItemRow } from "./notification-item-row"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const PAGE_SIZE = 25

function parseTypes(value: string | null): string[] {
    if (!value) return []
    return value.split(",").map((s) => s.trim()).filter(Boolean)
}

export function NotificationsPage() {
    useDocumentTitle("Notifications")
    const [searchParams, setSearchParams] = useSearchParams()
    const unreadOnly = searchParams.get("unread") === "1"
    const types = useMemo(
        () => parseTypes(searchParams.get("types")),
        [searchParams],
    )
    const offset = Math.max(0, Number(searchParams.get("offset") ?? "0")) || 0

    const list = useNotifications({
        unread_only: unreadOnly,
        types,
        limit: PAGE_SIZE,
        offset,
    })
    const kindsQuery = useNotificationKinds()
    const unreadCount = useUnreadCount().data?.count ?? 0
    const markAll = useMarkAllRead()

    const [confirmingMarkAll, setConfirmingMarkAll] = useState(false)

    const items = list.data?.items ?? []
    const total = list.data?.count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const currentPage = Math.floor(offset / PAGE_SIZE) + 1

    const updateParams = (next: URLSearchParams) => {
        setSearchParams(next, { replace: false })
    }

    const filterValue: string = unreadOnly
        ? "unread"
        : types[0]
            ? `kind:${types[0]}`
            : ""

    const handleFilterChange = (value: string) => {
        const next = new URLSearchParams()
        if (value === "unread") {
            next.set("unread", "1")
        } else if (value.startsWith("kind:")) {
            next.set("types", value.slice("kind:".length))
        }
        updateParams(next)
    }

    const clearFilters = () => {
        updateParams(new URLSearchParams())
    }

    const hasFilter = unreadOnly || types.length > 0

    const setPage = (page: number) => {
        const next = new URLSearchParams(searchParams)
        const newOffset = Math.max(0, (page - 1) * PAGE_SIZE)
        if (newOffset === 0) {
            next.delete("offset")
        } else {
            next.set("offset", String(newOffset))
        }
        updateParams(next)
    }

    const handleMarkAll = () => {
        setConfirmingMarkAll(true)
        markAll.mutate(undefined, {
            onSuccess: () => {
                toast.success("All notifications marked as read!")
            },
            onError: (err) => {
                toast.error(getErrorMessage(err, "Couldn't mark all as read..."))
            },
            onSettled: () => {
                setConfirmingMarkAll(false)
            },
        })
    }

    return (
        <PageShell>
            <Panel className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold">
                        Notifications
                    </h2>
                    {unreadCount > 0 && (
                        <Badge variant="secondary">
                            {unreadCount} unread
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAll}
                        disabled={
                            unreadCount === 0
                            || markAll.isPending
                            || confirmingMarkAll
                        }
                        className="ml-auto"
                    >
                        Mark All Read
                    </Button>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                    <span className="text-xs text-muted-foreground">
                        <Cog className="size-3 inline -mt-0.5 mr-1" />
                        Filter
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        <ToggleGroup
                            type="single"
                            size="sm"
                            variant="outline"
                            value={filterValue}
                            onValueChange={handleFilterChange}
                            className="flex w-full flex-wrap justify-start gap-1"
                        >
                            <ToggleGroupItem
                                value="unread"
                                aria-label="Show Unread Only"
                                className="flex-initial rounded-md border px-3 data-[variant=outline]:border-l"
                            >
                                Unread
                            </ToggleGroupItem>
                            {(kindsQuery.data?.kinds ?? []).map((k) => (
                                <ToggleGroupItem
                                    key={k.kind}
                                    value={`kind:${k.kind}`}
                                    aria-label={k.label}
                                    className="flex-initial rounded-md border px-3 data-[variant=outline]:border-l"
                                >
                                    {k.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                        {hasFilter && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={clearFilters}
                                className="text-xs shrink-0"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {list.isError && (
                    <AlertBanner variant="error">
                        Could not load notifications. Refresh to try again...
                    </AlertBanner>
                )}

                {list.isLoading && (
                    <div className="flex flex-col gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3 p-2">
                                <Skeleton className="size-5 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-1/3" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!list.isLoading && !list.isError && items.length === 0 && (
                    <EmptyState
                        inset
                        icon={Bell}
                        title={
                            unreadOnly
                                ? "No Unread Notifications"
                                : "No Notifications Yet"
                        }
                        description={
                            unreadOnly
                                ? "You're all caught up!"
                                : "When something happens with your runs, mod role, or API keys, it'll show up here!"
                        }
                    />
                )}

                {!list.isLoading && !list.isError && items.length > 0 && (
                    <div className={cn(
                        "rounded-md border border-border/40",
                    )}>
                        {items.map((n, idx) => (
                            <div
                                key={n.id}
                                className={cn(
                                    idx !== 0 && "border-t border-border/40",
                                )}
                            >
                                <NotificationItemRow notification={n} />
                            </div>
                        ))}
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalLabel={total > 0 ? `${total} total` : null}
                />
            </Panel>
        </PageShell>
    )
}
