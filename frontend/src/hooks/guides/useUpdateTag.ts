import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { updateTagFn } from "./tags-api"
import type { Tag, TagUpdateInput } from "@/types/guides"

interface Vars {
    slug: string
    data: TagUpdateInput
}

export function useUpdateTag() {
    const qc = useQueryClient()
    return useMutation<Tag, Error, Vars>({
        mutationFn: ({ slug, data }) => updateTagFn(slug, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.tags.all })
            qc.invalidateQueries({ queryKey: queryKeys.guides.all })
        },
    })
}
