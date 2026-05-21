import { useMutation } from "@tanstack/react-query"
import { updateProfileFn } from "./auth-api"
import { useInvalidateCurrentPlayer } from "./useSession"

export function useUpdateProfile() {
    const invalidate = useInvalidateCurrentPlayer()
    return useMutation({
        mutationFn: updateProfileFn,
        onSuccess: () => invalidate(),
    })
}
