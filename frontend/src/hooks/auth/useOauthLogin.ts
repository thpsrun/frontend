import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { runOAuthLogin, type OAuthLoginErrorReason } from "@/lib/oauth-login"
import type { AuthProvider } from "@/types/auth"

export type OauthLoginHookResult =
    | { ok: true, provider: AuthProvider }
    | { ok: false, reason: OAuthLoginErrorReason }

export function useOauthLogin() {
    const qc = useQueryClient()
    const [pending, setPending] = useState<AuthProvider | null>(null)

    const login = useCallback(
        async (provider: AuthProvider): Promise<OauthLoginHookResult> => {
            setPending(provider)
            try {
                const result = await runOAuthLogin(provider)
                if (!result.ok) {
                    return { ok: false, reason: result.reason }
                }
                qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
                return { ok: true, provider: result.provider }
            } finally {
                setPending(null)
            }
        },
        [qc],
    )

    return { login, pending }
}
