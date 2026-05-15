import { useMutation } from "@tanstack/react-query"
import { loginFn, submitTotpFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"
import type { LoginRequest, LoginOptions } from "@/types/auth"

interface LoginVariables {
    data: LoginRequest
    options: LoginOptions
}

export function useLogin() {
    const invalidateAuth = useInvalidateAuth()
    return useMutation({
        mutationFn: ({ data, options }: LoginVariables) => loginFn(data, options),
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
