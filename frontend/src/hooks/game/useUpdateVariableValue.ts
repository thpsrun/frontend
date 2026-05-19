import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import {
    updateVariableValueFn,
    type UpdateVariableValueRequest,
} from "./variables-api"

export function useUpdateVariableValue(gameSlug: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (vars: { valueId: string; data: UpdateVariableValueRequest }) =>
            updateVariableValueFn(vars.valueId, vars.data),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: queryKeys.games.detail(gameSlug),
            })
        },
    })
}
