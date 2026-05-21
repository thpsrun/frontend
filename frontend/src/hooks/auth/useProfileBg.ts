import { useMutation } from "@tanstack/react-query"
import { uploadProfileBgFn, deleteProfileBgFn } from "./auth-api"
import { useInvalidateCurrentPlayer } from "./useSession"

export function useUploadProfileBg() {
    const invalidate = useInvalidateCurrentPlayer()
    return useMutation({
        mutationFn: uploadProfileBgFn,
        onSuccess: () => invalidate(),
    })
}

export function useDeleteProfileBg() {
    const invalidate = useInvalidateCurrentPlayer()
    return useMutation({
        mutationFn: deleteProfileBgFn,
        onSuccess: () => invalidate(),
    })
}
