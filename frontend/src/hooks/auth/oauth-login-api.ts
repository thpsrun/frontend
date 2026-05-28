import { apiFetch } from "@/lib/api-client"
import type { AuthProvider } from "@/types/auth"

export interface OAuthLoginInitiateResponse {
    authorize_url: string
}

export const initiateOAuthLoginFn = (
    provider: AuthProvider,
    turnstileToken: string | null = null,
): Promise<OAuthLoginInitiateResponse> =>
    apiFetch<OAuthLoginInitiateResponse>(
        `/auth/oauth-login/${provider}`,
        { method: "POST", turnstileToken },
    )
