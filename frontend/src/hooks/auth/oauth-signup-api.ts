import { apiFetch, ApiError } from "@/lib/api-client"
import type { AuthProvider, OauthSignupRequest } from "@/types/auth"

export interface OAuthSignupInitiateResponse {
    authorize_url: string
}

export const initiateOAuthSignupFn = (
    provider: AuthProvider,
    turnstileToken: string | null = null,
): Promise<OAuthSignupInitiateResponse> =>
    apiFetch<OAuthSignupInitiateResponse>(
        `/auth/oauth-signup/${provider}`,
        { method: "POST", turnstileToken },
    )

export type FinalizeOauthSignupResult =
    | { kind: "ok" }
    | { kind: "verification_required" }

function isVerifyEmailPending(err: ApiError): boolean {
    if (err.status !== 401) return false
    const body = err.body as
        | { data?: { flows?: Array<{ id?: string }> } }
        | null
    return Boolean(body?.data?.flows?.some((f) => f?.id === "verify_email"))
}

export async function finalizeOauthSignupFn(
    body: OauthSignupRequest,
    turnstileToken: string | null = null,
): Promise<FinalizeOauthSignupResult> {
    try {
        await apiFetch<void>(
            "/auth/provider/signup",
            { base: "allauth", method: "POST", json: body, turnstileToken },
        )
        return { kind: "ok" }
    } catch (err) {
        if (err instanceof ApiError && isVerifyEmailPending(err)) {
            return { kind: "verification_required" }
        }
        throw err
    }
}
