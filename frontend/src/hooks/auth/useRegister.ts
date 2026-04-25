import { registerFn } from "./auth-api"
import { useInvalidateAuth } from "./useSession"
import {
    useInvalidatingMutation,
} from "@/hooks/use-invalidating-mutation"

export function useRegister() {
    return useInvalidatingMutation(registerFn, useInvalidateAuth())
}
