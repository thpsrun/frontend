import { useMutation, useQueryClient } from "@tanstack/react-query"
import { startRegistration } from "@simplewebauthn/browser"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { getErrorMessage } from "@/lib/utils"
import { reauthenticateFn } from "./auth-api"
import { enrollPasskey, getPasskeyEnrollOptions } from "./passkey-api"

interface EnrollArgs {
    name: string
    password: string
}

export function useEnrollPasskey() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ name, password }: EnrollArgs) => {
            await reauthenticateFn(password)
            const options = await getPasskeyEnrollOptions()
            const credential = await startRegistration({ optionsJSON: options })
            await enrollPasskey(name, credential)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            toast.success("Passkey added.")
        },
        onError: (err) => {
            if (err instanceof Error && err.name === "NotAllowedError") return
            toast.error(getErrorMessage(err, "Failed to add passkey."))
        },
    })
}
