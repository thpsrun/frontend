import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { updateGuideFn } from "./guides-api"
import type { Guide, GuideUpdateInput } from "@/types/guides"

interface Vars {
    gameSlug: string
    slug: string
    data: GuideUpdateInput
}

export function useUpdateGuide() {
    const qc = useQueryClient()
    return useMutation<Guide, Error, Vars>({
        mutationFn: ({ gameSlug, slug, data }) => updateGuideFn(gameSlug, slug, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.guides.all })
        },
    })
}
