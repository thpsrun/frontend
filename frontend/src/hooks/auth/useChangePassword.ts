import { useMutation } from "@tanstack/react-query"
import { changePasswordFn } from "./auth-api"

export function useChangePassword() {
    return useMutation({
        mutationFn: changePasswordFn,
    })
}
