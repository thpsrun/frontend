import { uploadPfpFn } from "./auth-api"
import { useInvalidateCurrentPlayer } from "./useSession"
import {
    useInvalidatingMutation,
} from "@/hooks/use-invalidating-mutation"

export function useUploadPfp() {
    return useInvalidatingMutation(
        uploadPfpFn,
        useInvalidateCurrentPlayer(),
    )
}
