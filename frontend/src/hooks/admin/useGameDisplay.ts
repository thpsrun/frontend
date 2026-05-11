import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/lib/query-keys"
import { getErrorMessage } from "@/lib/utils"
import type {
    GameDisplayResponse,
    ReorderRequest,
    VisibilityRequest,
} from "@/types/admin-game-display"
import {
    fetchGameDisplay,
    reorderDisplayItemsFn,
    setDisplayVisibilityFn,
} from "./game-display-api"

export function useGameDisplay(gameId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.admin.gameDisplay(gameId ?? ""),
        queryFn: ({ signal }) => fetchGameDisplay(gameId!, signal),
        enabled: Boolean(gameId),
        staleTime: 60 * 1000,
    })
}

const reorderArrayByIds = <T extends { id: string }>(
    items: T[],
    orderedIds: string[],
): T[] => {
    const lookup = new Map(items.map((item) => [item.id, item]))
    const orderedSet = new Set(orderedIds)
    const result: T[] = []
    for (const id of orderedIds) {
        const item = lookup.get(id)
        if (item) result.push(item)
    }
    for (const item of items) {
        if (!orderedSet.has(item.id)) result.push(item)
    }
    return result
}

export function useReorderDisplayItems(gameId: string) {
    const queryClient = useQueryClient()
    const key = queryKeys.admin.gameDisplay(gameId)

    return useMutation<
        void,
        Error,
        ReorderRequest,
        { previous: GameDisplayResponse | undefined }
    >({
        mutationFn: (body) => reorderDisplayItemsFn(gameId, body),
        onMutate: async (body) => {
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<GameDisplayResponse>(key)
            if (previous) {
                const next: GameDisplayResponse = { ...previous }
                if (body.scope === "category") {
                    next.categories = reorderArrayByIds(
                        previous.categories,
                        body.ordered_ids,
                    )
                } else if (body.scope === "level") {
                    next.levels = reorderArrayByIds(
                        previous.levels,
                        body.ordered_ids,
                    )
                } else if (body.scope === "variable_value" && body.var_id) {
                    const varId = body.var_id
                    next.variable_groups = previous.variable_groups.map((g) =>
                        g.variable_id === varId
                            ? {
                                ...g,
                                values: reorderArrayByIds(
                                    g.values,
                                    body.ordered_ids,
                                ),
                            }
                            : g,
                    )
                }
                queryClient.setQueryData(key, next)
            }
            return { previous }
        },
        onError: (err, _body, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(key, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to save order."))
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export function useSetDisplayVisibility(gameId: string) {
    const queryClient = useQueryClient()
    const key = queryKeys.admin.gameDisplay(gameId)

    return useMutation<
        void,
        Error,
        VisibilityRequest,
        { previous: GameDisplayResponse | undefined }
    >({
        mutationFn: (body) => setDisplayVisibilityFn(gameId, body),
        onMutate: async (body) => {
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<GameDisplayResponse>(key)
            if (previous) {
                const next: GameDisplayResponse = { ...previous }
                if (body.target_type === "category") {
                    next.categories = previous.categories.map((c) =>
                        c.id === body.target_id
                            ? { ...c, appear_on_main: body.value }
                            : c,
                    )
                } else if (body.target_type === "variable_value") {
                    next.variable_groups = previous.variable_groups.map((g) => ({
                        ...g,
                        values: g.values.map((v) =>
                            v.id === body.target_id
                                ? { ...v, appear_on_main: body.value }
                                : v,
                        ),
                    }))
                }
                queryClient.setQueryData(key, next)
            }
            return { previous }
        },
        onError: (err, _body, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(key, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to update visibility."))
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: key })
        },
    })
}
