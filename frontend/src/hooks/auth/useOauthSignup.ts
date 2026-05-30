import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { runOAuthSignup, type OAuthSignupErrorReason } from "@/lib/oauth-signup"
import {
    finalizeOauthSignupFn,
    fetchProviderSignupInfoFn,
    type FinalizeOauthSignupResult,
} from "@/hooks/auth/oauth-signup-api"
import type { AuthProvider, OauthSignupRequest } from "@/types/auth"

export type OauthSignupHookResult =
    | { ok: true, verificationRequired?: boolean, providerEmail?: string | null }
    | { ok: false, kind: "popup", reason: OAuthSignupErrorReason }
    | { ok: false, kind: "finalize", code: string | null }
    | { ok: false, kind: "email_required" }
    | { ok: false, kind: "email_taken", providerEmail: string | null }

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
                const { providerEmail } = await fetchProviderSignupInfoFn()
                let finalize: FinalizeOauthSignupResult
                try {
                    finalize = await finalizeOauthSignupFn(body, turnstileToken)
                } catch (err) {
                    const code = err instanceof ApiError ? err.code : null
                    return { ok: false, kind: "finalize", code }
                }
                if (finalize.kind === "email_required") {
                    return { ok: false, kind: "email_required" }
                }
                if (finalize.kind === "email_taken") {
                    return { ok: false, kind: "email_taken", providerEmail }
                }
                if (finalize.kind === "verification_required") {
                    return { ok: true, verificationRequired: true, providerEmail }
                }
                qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
                qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
                return { ok: true, providerEmail }
            } finally {
                setPending(null)
            }
        },
        [qc],
    )

    return { signup, pending }
}
