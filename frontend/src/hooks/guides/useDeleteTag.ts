import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { deleteTagFn } from "./tags-api"

export function useDeleteTag() {
    const qc = useQueryClient()
    return useMutation<void, Error, string>({
        mutationFn: (slug) => deleteTagFn(slug),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.tags.all })
            qc.invalidateQueries({ queryKey: queryKeys.guides.all })
        },
    })
}
