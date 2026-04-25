import { deleteAccountFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"
import {
    useInvalidatingMutation,
} from "@/hooks/use-invalidating-mutation"

export function useDeleteAccount() {
    return useInvalidatingMutation(deleteAccountFn, useInvalidateAuth())
}
