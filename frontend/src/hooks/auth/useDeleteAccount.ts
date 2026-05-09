import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { deleteAccountFn, reauthenticateFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"

interface DeleteAccountArgs {
    password: string
}

export function useDeleteAccount() {
    const invalidate = useInvalidateAuth()
    return useMutation<void, Error, DeleteAccountArgs>({
        mutationFn: async ({ password }) => {
            await reauthenticateFn(password)
            await deleteAccountFn()
        },
        onSuccess: () => {
            invalidate()
            toast.success("Account Deleted!")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Account Deletion Failed..."))
        },
    })
}
