import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { updateGuideFn } from "./guides-api"
import type { Guide, GuideUpdateInput } from "@/types/guides"

interface Vars {
    slug: string
    data: GuideUpdateInput
}

export function useUpdateGuide() {
    const qc = useQueryClient()
    return useMutation<Guide, Error, Vars>({
        mutationFn: ({ slug, data }) => updateGuideFn(slug, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.guides.all })
        },
    })
}
