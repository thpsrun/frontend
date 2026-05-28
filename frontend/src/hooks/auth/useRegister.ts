import { useMutation } from "@tanstack/react-query"
import { registerFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"
import type { RegisterRequest } from "@/types/auth"

type RegisterVariables = RegisterRequest & { turnstileToken?: string | null }

export function useRegister() {
    const invalidate = useInvalidateAuth()
    return useMutation({
        mutationFn: ({ turnstileToken, ...data }: RegisterVariables) =>
            registerFn(data, turnstileToken ?? null),
        onSuccess: () => invalidate(),
    })
}
