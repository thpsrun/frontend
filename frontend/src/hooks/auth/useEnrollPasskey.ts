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
            // Adding a passkey is a sensitive operation. Allauth requires
            // recent (re)authentication; we always reauth here so the flow
            // works regardless of how long the user has been on the page.
            await reauthenticateFn(password)
            const options = await getPasskeyEnrollOptions()
            const credential = await startRegistration({ optionsJSON: options })
            await enrollPasskey(name, credential)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.passkeys() })
            toast.success("Passkey added.")
        },
        onError: (err) => {
            // Browser cancellation throws NotAllowedError; show no toast for that.
            if (err instanceof Error && err.name === "NotAllowedError") return
            toast.error(getErrorMessage(err, "Failed to add passkey."))
        },
    })
}
