import { apiFetch } from "@/lib/api-client"
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

export const finalizeOauthSignupFn = (
    body: OauthSignupRequest,
    turnstileToken: string | null = null,
): Promise<void> =>
    apiFetch<void>(
        "/auth/provider/signup",
        { base: "allauth", method: "POST", json: body, turnstileToken },
    )
