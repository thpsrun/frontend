import { updateProfileFn } from "./auth-api"
import { useInvalidateCurrentPlayer } from "./useSession"
import {
    useInvalidatingMutation,
} from "@/hooks/use-invalidating-mutation"

export function useUpdateProfile() {
    return useInvalidatingMutation(
        updateProfileFn,
        useInvalidateCurrentPlayer(),
    )
}
