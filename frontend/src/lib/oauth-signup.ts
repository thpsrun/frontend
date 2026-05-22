import { ApiError } from "@/lib/api-client"
import { BACKEND_URL } from "@/constants"
import { initiateOAuthSignupFn } from "@/hooks/auth/oauth-signup-api"
import type { AuthProvider } from "@/types/auth"

const BACKEND_ORIGIN = new URL(BACKEND_URL).origin

export type OAuthSignupErrorReason =
    | "intent_expired"
    | "provider_mismatch"
    | "already_linked"
    | "provider_error"
    | "discord_handle_taken"
    | "twitch_handle_taken"
    | "signup_closed"
    | "cancelled"
    | "popup_blocked"
    | "initiate_unsupported_provider"
    | "initiate_already_authenticated"
    | "initiate_rate_limited"
    | "initiate_failed"

export type OAuthSignupResult =
    | { ok: true, provider: AuthProvider }
    | { ok: false, reason: OAuthSignupErrorReason }

const KNOWN_POPUP_REASONS: ReadonlySet<OAuthSignupErrorReason> = new Set([
    "intent_expired",
    "provider_mismatch",
    "already_linked",
    "provider_error",
    "discord_handle_taken",
    "twitch_handle_taken",
    "signup_closed",
])

const KNOWN_PROVIDERS: ReadonlySet<AuthProvider> = new Set([
    "discord",
    "twitch",
])

interface OAuthSignupMessage {
    type: "oauth_signup"
    status: "ok" | "error" | "cancelled"
    reason: string
    provider: string
}

function isOAuthSignupMessage(value: unknown): value is OAuthSignupMessage {
    if (!value || typeof value !== "object") return false
    const v = value as Record<string, unknown>
    return v.type === "oauth_signup"
        && (v.status === "ok" || v.status === "error" || v.status === "cancelled")
        && typeof v.reason === "string"
        && typeof v.provider === "string"
}

function narrowPopupReason(raw: string): OAuthSignupErrorReason {
    return KNOWN_POPUP_REASONS.has(raw as OAuthSignupErrorReason)
        ? (raw as OAuthSignupErrorReason)
        : "provider_error"
}

export async function runOAuthSignup(
    provider: AuthProvider,
): Promise<OAuthSignupResult> {
    const popup = window.open(
        "about:blank",
        "oauth_signup",
        "width=520,height=720,resizable=yes,scrollbars=yes",
    )
    if (!popup || popup.closed) {
        return { ok: false, reason: "popup_blocked" }
    }

    let initiate: { authorize_url: string }
    try {
        initiate = await initiateOAuthSignupFn(provider)
    } catch (err) {
        popup.close()
        if (err instanceof ApiError) {
            if (err.isRateLimited) {
                return { ok: false, reason: "initiate_rate_limited" }
            }
            if (err.code === "unsupported_provider") {
                return { ok: false, reason: "initiate_unsupported_provider" }
            }
            if (err.code === "already_authenticated") {
                return { ok: false, reason: "initiate_already_authenticated" }
            }
        }
        return { ok: false, reason: "initiate_failed" }
    }

    let targetUrl: URL
    try {
        targetUrl = new URL(initiate.authorize_url)
    } catch {
        popup.close()
        return { ok: false, reason: "initiate_failed" }
    }
    if (targetUrl.protocol !== "https:" && targetUrl.protocol !== "http:") {
        popup.close()
        return { ok: false, reason: "initiate_failed" }
    }
    popup.location.href = targetUrl.toString()

    return new Promise<OAuthSignupResult>((resolve) => {
        let settled = false

        const finish = (result: OAuthSignupResult) => {
            if (settled) return
            settled = true
            window.removeEventListener("message", onMessage)
            clearInterval(pollId)
            if (!popup.closed) popup.close()
            resolve(result)
        }

        const onMessage = (event: MessageEvent) => {
            if (event.origin !== BACKEND_ORIGIN) return
            if (!isOAuthSignupMessage(event.data)) return
            const { status, reason, provider: msgProvider } = event.data
            if (status === "ok") {
                const resolved = KNOWN_PROVIDERS.has(msgProvider as AuthProvider)
                    ? (msgProvider as AuthProvider)
                    : provider
                finish({ ok: true, provider: resolved })
            } else if (status === "cancelled") {
                finish({ ok: false, reason: "cancelled" })
            } else {
                finish({ ok: false, reason: narrowPopupReason(reason) })
            }
        }

        const pollId = window.setInterval(() => {
            if (popup.closed) finish({ ok: false, reason: "cancelled" })
        }, 500)

        window.addEventListener("message", onMessage)
    })
}
