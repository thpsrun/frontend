import { useMutation } from "@tanstack/react-query"
import { resendEmailChangeFn } from "./email-api"

export function useResendEmailChange() {
    return useMutation({
        mutationFn: () => resendEmailChangeFn(),
    })
}
