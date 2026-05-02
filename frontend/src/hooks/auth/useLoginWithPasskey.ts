import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { startAuthentication } from "@simplewebauthn/browser"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { getErrorMessage } from "@/lib/utils"
import { completePasskeyLogin, getPasskeyLoginOptions } from "./passkey-api"

export function useLoginWithPasskey() {
    const qc = useQueryClient()
    const navigate = useNavigate()
    return useMutation({
        mutationFn: async () => {
            const options = await getPasskeyLoginOptions()
            const credential = await startAuthentication({ optionsJSON: options })
            await completePasskeyLogin(credential)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
            navigate("/")
        },
        onError: (err) => {
            // Browser cancellation throws NotAllowedError; show no toast for that.
            if (err instanceof Error && err.name === "NotAllowedError") return
            toast.error(getErrorMessage(err, "Passkey login failed."))
        },
    })
}
