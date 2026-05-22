import { useMutation, useQueryClient } from "@tanstack/react-query"
import { startRegistration } from "@simplewebauthn/browser"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { enrollPasskey, getPasskeyEnrollOptions } from "./passkey-api"

export function useEnrollPasskey() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (name: string) => {
            const options = await getPasskeyEnrollOptions()
            const credential = await startRegistration({ optionsJSON: options })
            await enrollPasskey(name, credential)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.authenticators() })
            toast.success("Passkey Added!")
        },
    })
}
