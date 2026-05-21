import { useMutation } from "@tanstack/react-query"
import { logoutFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"

export function useLogout() {
    const invalidate = useInvalidateAuth()
    return useMutation({
        mutationFn: logoutFn,
        onSuccess: () => invalidate(),
    })
}
