import { uploadProfileBgFn, deleteProfileBgFn } from "./auth-api"
import { useInvalidateCurrentPlayer } from "./useSession"
import {
    useInvalidatingMutation,
} from "@/hooks/use-invalidating-mutation"

export function useUploadProfileBg() {
    return useInvalidatingMutation(
        uploadProfileBgFn,
        useInvalidateCurrentPlayer(),
    )
}

export function useDeleteProfileBg() {
    return useInvalidatingMutation(
        deleteProfileBgFn,
        useInvalidateCurrentPlayer(),
    )
}
