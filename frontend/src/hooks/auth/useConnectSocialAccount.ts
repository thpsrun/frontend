import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { runOAuthConnect, type OAuthConnectResult } from "@/lib/oauth-connect"
import type { AuthProvider } from "@/types/auth"

export function useConnectSocialAccount() {
    const qc = useQueryClient()
    const [pending, setPending] = useState<AuthProvider | null>(null)

    const connect = useCallback(
        async (provider: AuthProvider): Promise<OAuthConnectResult> => {
            setPending(provider)
            try {
                const result = await runOAuthConnect(provider)
                if (result.ok) {
                    qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
                    qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
                }
                return result
            } finally {
                setPending(null)
            }
        },
        [qc],
    )

    return { connect, pending }
}
