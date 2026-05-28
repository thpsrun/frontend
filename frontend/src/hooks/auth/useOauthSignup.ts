import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { runOAuthSignup, type OAuthSignupErrorReason } from "@/lib/oauth-signup"
import { finalizeOauthSignupFn } from "@/hooks/auth/oauth-signup-api"
import type { AuthProvider, OauthSignupRequest } from "@/types/auth"

export type OauthSignupHookResult =
    | { ok: true }
    | { ok: false, kind: "popup", reason: OAuthSignupErrorReason }
    | { ok: false, kind: "finalize", code: string | null }

export function useOauthSignup() {
    const qc = useQueryClient()
    const [pending, setPending] = useState<AuthProvider | null>(null)

    const signup = useCallback(
        async (
            provider: AuthProvider,
            body: OauthSignupRequest,
            turnstileToken: string | null = null,
        ): Promise<OauthSignupHookResult> => {
            setPending(provider)
            try {
                const popupResult = await runOAuthSignup(provider, turnstileToken)
                if (!popupResult.ok) {
                    return {
                        ok: false,
                        kind: "popup",
                        reason: popupResult.reason,
                    }
                }
                try {
                    await finalizeOauthSignupFn(body, turnstileToken)
                } catch (err) {
                    const code = err instanceof ApiError ? err.code : null
                    return { ok: false, kind: "finalize", code }
                }
                qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
                return { ok: true }
            } finally {
                setPending(null)
            }
        },
        [qc],
    )

    return { signup, pending }
}
