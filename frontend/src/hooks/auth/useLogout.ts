import { logoutFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"
import {
    useInvalidatingMutation,
} from "@/hooks/use-invalidating-mutation"

export function useLogout() {
    return useInvalidatingMutation(logoutFn, useInvalidateAuth())
}
