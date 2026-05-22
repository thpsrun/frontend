import { apiFetch } from "@/lib/api-client"
import type { AuthProvider } from "@/types/auth"

export interface OAuthReauthInitiateResponse {
    authorize_url: string
}

export const initiateOAuthReauthFn = (
    provider: AuthProvider,
): Promise<OAuthReauthInitiateResponse> =>
    apiFetch<OAuthReauthInitiateResponse>(
        `/auth/me/auth/reauthenticate/oauth/${provider}`,
        { method: "POST" },
    )
