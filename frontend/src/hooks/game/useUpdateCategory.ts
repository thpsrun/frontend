import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import {
    updateCategoryFn,
    type UpdateCategoryRequest,
} from "./categories-api"

export function useUpdateCategory(gameSlug: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (vars: { categoryId: string; data: UpdateCategoryRequest }) =>
            updateCategoryFn(vars.categoryId, vars.data),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: queryKeys.games.detail(gameSlug),
            })
        },
    })
}
