import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { getErrorMessage } from "@/lib/utils"
import { reauthenticateFn } from "./auth-api"
import { deletePasskey } from "./passkey-api"

interface DeleteArgs {
    id: string
    password: string
}

export function useDeletePasskey() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, password }: DeleteArgs) => {
            await reauthenticateFn(password)
            await deletePasskey(id)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.authenticators() })
            toast.success("Passkey removed.")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to remove passkey."))
        },
    })
}
