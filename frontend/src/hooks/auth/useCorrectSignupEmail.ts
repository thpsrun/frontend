import { useMutation } from "@tanstack/react-query"
import { correctSignupEmailFn } from "./email-api"

interface Variables {
    srcApiKey: string
    newEmail: string
}

export function useCorrectSignupEmail() {
    return useMutation({
        mutationFn: ({ srcApiKey, newEmail }: Variables) =>
            correctSignupEmailFn(srcApiKey, newEmail),
    })
}
