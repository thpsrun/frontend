import { useMutation } from "@tanstack/react-query"
import { loginFn, submitTotpFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"
import { clearSignupVerification } from "@/lib/signup-verification-state"
import type { LoginRequest, LoginOptions } from "@/types/auth"

interface LoginVariables {
    data: LoginRequest
    options: LoginOptions
    turnstileToken?: string | null
}

export function useLogin() {
    const invalidateAuth = useInvalidateAuth()
    return useMutation({
        mutationFn: ({ data, options, turnstileToken = null }: LoginVariables) =>
            loginFn(data, options, turnstileToken),
        onSuccess: (result) => {
            if (result.success) {
                clearSignupVerification()
                invalidateAuth()
            }
        },
    })
}

export function useSubmitTotp() {
    const invalidateAuth = useInvalidateAuth()
    return useMutation({
        mutationFn: submitTotpFn,
        onSuccess: () => {
            clearSignupVerification()
            invalidateAuth()
        },
    })
}
