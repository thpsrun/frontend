import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { updateGameFn, type UpdateGameRequest } from "./games-api"

export function useUpdateGame() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (vars: { slug: string; data: UpdateGameRequest }) =>
            updateGameFn(vars.slug, vars.data),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({
                queryKey: queryKeys.games.detail(vars.slug),
            })
        },
    })
}
