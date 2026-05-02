import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { createGuideFn } from "./guides-api"
import type { Guide, GuideCreateInput } from "@/types/guides"

export function useCreateGuide() {
    const qc = useQueryClient()
    return useMutation<Guide, Error, GuideCreateInput>({
        mutationFn: (input) => createGuideFn(input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.guides.all })
        },
    })
}
