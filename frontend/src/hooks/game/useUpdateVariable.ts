import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import {
    updateVariableFn,
    type UpdateVariableRequest,
} from "./variables-api"

export function useUpdateVariable(gameSlug: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (vars: { variableId: string; data: UpdateVariableRequest }) =>
            updateVariableFn(vars.variableId, vars.data),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: queryKeys.games.detail(gameSlug),
            })
        },
    })
}
