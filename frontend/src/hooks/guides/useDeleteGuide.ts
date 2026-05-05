import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { deleteGuideFn } from "./guides-api"

export function useDeleteGuide() {
    const qc = useQueryClient()
    return useMutation<void, Error, string>({
        mutationFn: (slug) => deleteGuideFn(slug),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.guides.all })
        },
    })
}
