import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { deletePasskey } from "./passkey-api"

export function useDeletePasskey() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deletePasskey(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.authenticators() })
            toast.success("Passkey removed.")
        },
    })
}
