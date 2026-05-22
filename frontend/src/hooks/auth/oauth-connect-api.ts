import { apiFetch } from "@/lib/api-client"
import type { AuthProvider } from "@/types/auth"

export interface OAuthConnectInitiateResponse {
    authorize_url: string
}

export const initiateOAuthConnectFn = (
    provider: AuthProvider,
): Promise<OAuthConnectInitiateResponse> =>
    apiFetch<OAuthConnectInitiateResponse>(
        `/auth/me/auth/connect/oauth/${provider}`,
        { method: "POST" },
    )
