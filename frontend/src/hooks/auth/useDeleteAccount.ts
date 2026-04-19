import { useMutation } from "@tanstack/react-query"
import { deleteAccountFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"

export function useDeleteAccount() {
    const invalidateAuth = useInvalidateAuth()
    return useMutation({
        mutationFn: deleteAccountFn,
        onSuccess: () => invalidateAuth(),
    })
}
