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

interface ProviderSignupAddress {
    email?: string
    verified?: boolean
    primary?: boolean
}

export async function fetchProviderSignupInfoFn(): Promise<{ providerEmail: string | null }> {
    try {
        const res = await apiFetch<{ data?: { email?: ProviderSignupAddress[] } }>(
            "/auth/provider/signup",
            { base: "allauth", method: "GET" },
        )
        const list = res?.data?.email ?? []
        const providerEmail = (list.find((e) => e.primary) ?? list[0])?.email ?? null
        return { providerEmail }
    } catch {
        return { providerEmail: null }
    }
}

export type FinalizeOauthSignupResult =
    | { kind: "ok" }
    | { kind: "verification_required" }
    | { kind: "email_required" }
    | { kind: "email_taken" }

function isVerifyEmailPending(err: ApiError): boolean {
    if (err.status !== 401) return false
    const body = err.body as
        | { data?: { flows?: Array<{ id?: string }> } }
        | null
    return Boolean(body?.data?.flows?.some((f) => f?.id === "verify_email"))
}

function emailErrorCode(err: ApiError): "email_required" | "email_taken" | null {
    if (err.status !== 400) return null
    const body = err.body as
        | { errors?: Array<{ code?: string, param?: string }> }
        | null
    const entry = body?.errors?.find((e) => e.param === "email")
    if (entry?.code === "email_required") return "email_required"
    if (entry?.code === "email_taken") return "email_taken"
    return null
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
        if (err instanceof ApiError) {
            if (isVerifyEmailPending(err)) {
                return { kind: "verification_required" }
            }
            const emailCode = emailErrorCode(err)
            if (emailCode === "email_required") return { kind: "email_required" }
            if (emailCode === "email_taken") return { kind: "email_taken" }
        }
        throw err
    }
}
