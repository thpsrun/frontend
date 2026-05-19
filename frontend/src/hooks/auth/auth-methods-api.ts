import { apiFetch } from "@/lib/api-client"
import type {
    AuthMethodsSummary,
    AuthProvider,
    OauthSignupRequest,
} from "@/types/auth"

export const fetchAuthMethodsFn = (
    signal?: AbortSignal,
): Promise<AuthMethodsSummary> =>
    apiFetch<AuthMethodsSummary>("/auth/me/auth/methods", { signal })

export const disconnectSocialAccountFn = (
    provider: AuthProvider,
): Promise<void> =>
    apiFetch<void>(
        `/auth/me/auth/social-accounts/${provider}`,
        { method: "DELETE" },
    )

export const deletePasswordFn = (): Promise<void> =>
    apiFetch<void>(
        "/auth/me/auth/password",
        { method: "DELETE" },
    )

export const finalizeOauthSignupFn = (
    body: OauthSignupRequest,
): Promise<void> =>
    apiFetch<void>(
        "/auth/provider/signup",
        { base: "allauth", method: "POST", json: body },
    )
