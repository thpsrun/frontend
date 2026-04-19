import { useMutation } from "@tanstack/react-query"
import { registerFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"

export function useRegister() {
    const invalidateAuth = useInvalidateAuth()
    return useMutation({
        mutationFn: registerFn,
        onSuccess: () => invalidateAuth(),
    })
}
