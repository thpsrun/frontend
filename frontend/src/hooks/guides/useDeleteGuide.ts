import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { deleteGuideFn } from "./guides-api"

interface Vars {
    gameSlug: string
    slug: string
}

export function useDeleteGuide() {
    const qc = useQueryClient()
    return useMutation<void, Error, Vars>({
        mutationFn: ({ gameSlug, slug }) => deleteGuideFn(gameSlug, slug),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.guides.all })
        },
    })
}
