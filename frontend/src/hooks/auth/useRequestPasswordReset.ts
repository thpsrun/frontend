import { useMutation } from "@tanstack/react-query"
import { requestPasswordResetFn } from "./auth-api"

interface RequestPasswordResetVariables {
    email: string
    turnstileToken?: string | null
}

export function useRequestPasswordReset() {
    return useMutation({
        mutationFn: ({ email, turnstileToken = null }: RequestPasswordResetVariables) =>
            requestPasswordResetFn(email, turnstileToken),
    })
}
