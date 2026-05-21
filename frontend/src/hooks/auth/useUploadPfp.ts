import { useMutation } from "@tanstack/react-query"
import { uploadPfpFn } from "./auth-api"
import { useInvalidateCurrentPlayer } from "./useSession"

export function useUploadPfp() {
    const invalidate = useInvalidateCurrentPlayer()
    return useMutation({
        mutationFn: uploadPfpFn,
        onSuccess: () => invalidate(),
    })
}
