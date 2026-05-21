import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import type {
    Notification,
    NotificationListResponse,
    UnreadCountResponse,
} from "@/types/notifications"
import {
    markNotificationReadFn,
    markAllReadFn,
    deleteNotificationFn,
} from "./notifications-api"

type QueryClient = ReturnType<typeof useQueryClient>
type ListEntry = readonly [readonly unknown[], NotificationListResponse | undefined]

const LIST_PREFIX = [...queryKeys.notifications.all, "list"] as const

function snapshotLists(qc: QueryClient): ListEntry[] {
    return qc.getQueriesData<NotificationListResponse>({
        queryKey: LIST_PREFIX,
    }) as ListEntry[]
}

function restoreLists(qc: QueryClient, snapshots: ListEntry[]) {
    snapshots.forEach(([key, data]) => {
        if (data !== undefined) qc.setQueryData(key, data)
    })
}

function patchLists(
    qc: QueryClient,
    snapshots: ListEntry[],
    updater: (data: NotificationListResponse) => NotificationListResponse,
) {
    snapshots.forEach(([key, data]) => {
        if (!data || !Array.isArray(data.items)) return
        qc.setQueryData<NotificationListResponse>(key, updater(data))
    })
}

function snapshotUnread(qc: QueryClient): UnreadCountResponse | undefined {
    return qc.getQueryData<UnreadCountResponse>(
        queryKeys.notifications.unreadCount(),
    )
}

function setUnread(qc: QueryClient, value: UnreadCountResponse) {
    qc.setQueryData<UnreadCountResponse>(
        queryKeys.notifications.unreadCount(),
        value,
    )
}

function invalidateAll(qc: QueryClient) {
    qc.invalidateQueries({ queryKey: queryKeys.notifications.all })
}

interface MutationContext {
    countPrev: UnreadCountResponse | undefined
    listSnapshots: ListEntry[]
}

function readContext(ctx: unknown): MutationContext | undefined {
    return ctx as MutationContext | undefined
}

export function useMarkRead() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => markNotificationReadFn(id),
        onMutate: async (id) => {
            await qc.cancelQueries({ queryKey: queryKeys.notifications.all })
            const countPrev = snapshotUnread(qc)
            if (countPrev) {
                setUnread(qc, { count: Math.max(0, countPrev.count - 1) })
            }
            const listSnapshots = snapshotLists(qc)
            const readAt = new Date().toISOString()
            patchLists(qc, listSnapshots, (data) => ({
                ...data,
                items: data.items.map((n: Notification) =>
                    n.id === id
                        ? { ...n, is_read: true, read_at: n.read_at ?? readAt }
                        : n,
                ),
            }))
            return { countPrev, listSnapshots } satisfies MutationContext
        },
        onError: (_err, _vars, ctx) => {
            const c = readContext(ctx)
            if (!c) return
            if (c.countPrev) setUnread(qc, c.countPrev)
            restoreLists(qc, c.listSnapshots)
        },
        onSettled: () => invalidateAll(qc),
    })
}

export function useMarkAllRead() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: () => markAllReadFn(),
        onMutate: async () => {
            await qc.cancelQueries({ queryKey: queryKeys.notifications.all })
            const countPrev = snapshotUnread(qc)
            setUnread(qc, { count: 0 })
            const listSnapshots = snapshotLists(qc)
            const readAt = new Date().toISOString()
            patchLists(qc, listSnapshots, (data) => ({
                ...data,
                items: data.items.map((n: Notification) =>
                    n.is_read ? n : { ...n, is_read: true, read_at: readAt },
                ),
            }))
            return { countPrev, listSnapshots } satisfies MutationContext
        },
        onError: (_err, _vars, ctx) => {
            const c = readContext(ctx)
            if (!c) return
            if (c.countPrev) setUnread(qc, c.countPrev)
            restoreLists(qc, c.listSnapshots)
        },
        onSettled: () => invalidateAll(qc),
    })
}

export function useDeleteNotification() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id }: { id: number; wasUnread: boolean }) =>
            deleteNotificationFn(id),
        onMutate: async ({ id, wasUnread }) => {
            await qc.cancelQueries({ queryKey: queryKeys.notifications.all })
            const countPrev = snapshotUnread(qc)
            if (wasUnread && countPrev) {
                setUnread(qc, { count: Math.max(0, countPrev.count - 1) })
            }
            const listSnapshots = snapshotLists(qc)
            patchLists(qc, listSnapshots, (data) => ({
                ...data,
                count: Math.max(0, data.count - 1),
                items: data.items.filter((n: Notification) => n.id !== id),
            }))
            return { countPrev, listSnapshots } satisfies MutationContext
        },
        onError: (_err, _vars, ctx) => {
            const c = readContext(ctx)
            if (!c) return
            if (c.countPrev) setUnread(qc, c.countPrev)
            restoreLists(qc, c.listSnapshots)
        },
        onSettled: () => invalidateAll(qc),
    })
}
