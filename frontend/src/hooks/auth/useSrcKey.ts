import { useMutation } from "@tanstack/react-query"
import { setSrcKeyFn, deleteSrcKeyFn } from "./auth-api"
import { useInvalidateCurrentPlayer } from "./useSession"

const NOT_MODERATOR_MSG = "You are no longer a moderator."

export function useSetSrcKey() {
    const invalidate = useInvalidateCurrentPlayer()
    return useMutation({
        mutationFn: setSrcKeyFn,
        onSuccess: () => invalidate(),
        onError: (error) => {
            if (error.message === NOT_MODERATOR_MSG) invalidate()
        },
    })
}

export function useDeleteSrcKey() {
    const invalidate = useInvalidateCurrentPlayer()
    return useMutation({
        mutationFn: deleteSrcKeyFn,
        onSuccess: () => invalidate(),
        onError: (error) => {
            if (error.message === NOT_MODERATOR_MSG) invalidate()
        },
    })
}
