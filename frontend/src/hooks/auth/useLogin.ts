import { useMutation } from "@tanstack/react-query"
import { loginFn, submitTotpFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"

export function useLogin() {
    const invalidateAuth = useInvalidateAuth()
    return useMutation({
        mutationFn: loginFn,
        onSuccess: (result) => {
            if (result.success) invalidateAuth()
        },
    })
}

export function useSubmitTotp() {
    const invalidateAuth = useInvalidateAuth()
    return useMutation({
        mutationFn: submitTotpFn,
        onSuccess: () => invalidateAuth(),
    })
}
