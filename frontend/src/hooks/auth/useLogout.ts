import { useMutation } from "@tanstack/react-query"
import { logoutFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"

export function useLogout() {
    const invalidateAuth = useInvalidateAuth()
    return useMutation({
        mutationFn: logoutFn,
        onSuccess: () => invalidateAuth(),
    })
}
