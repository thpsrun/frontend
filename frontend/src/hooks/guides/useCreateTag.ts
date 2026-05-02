import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { createTagFn } from "./tags-api"
import type { Tag, TagCreateInput } from "@/types/guides"

export function useCreateTag() {
    const qc = useQueryClient()
    return useMutation<Tag, Error, TagCreateInput>({
        mutationFn: (input) => createTagFn(input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.tags.all })
            qc.invalidateQueries({ queryKey: queryKeys.guides.all })
        },
    })
}
