import { useMutation } from "@tanstack/react-query"
import { confirmPasswordResetFn } from "./auth-api"

interface ConfirmPasswordResetVariables {
    key: string
    password: string
}

export function useConfirmPasswordReset() {
    return useMutation({
        mutationFn: ({ key, password }: ConfirmPasswordResetVariables) =>
            confirmPasswordResetFn(key, password),
    })
}
