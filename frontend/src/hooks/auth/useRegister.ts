import { useMutation } from "@tanstack/react-query"
import { registerFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"

export function useRegister() {
    const invalidate = useInvalidateAuth()
    return useMutation({
        mutationFn: registerFn,
        onSuccess: () => invalidate(),
    })
}
