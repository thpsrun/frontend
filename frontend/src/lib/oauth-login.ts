import { ApiError } from "@/lib/api-client"
import { BACKEND_URL } from "@/constants"
import { initiateOAuthLoginFn } from "@/hooks/auth/oauth-login-api"
import type { AuthProvider } from "@/types/auth"

const BACKEND_ORIGIN = new URL(BACKEND_URL).origin

export type OAuthLoginErrorReason =
    | "intent_expired"
    | "provider_mismatch"
    | "no_link"
    | "banned"
    | "provider_error"
    | "discord_handle_taken"
    | "twitch_handle_taken"
    | "cancelled"
    | "popup_blocked"
    | "initiate_unsupported_provider"
    | "initiate_already_authenticated"
    | "initiate_rate_limited"
    | "initiate_failed"

export type OAuthLoginResult =
    | { ok: true, provider: AuthProvider }
    | { ok: false, reason: OAuthLoginErrorReason }

const KNOWN_POPUP_REASONS: ReadonlySet<OAuthLoginErrorReason> = new Set([
    "intent_expired",
    "provider_mismatch",
    "no_link",
    "banned",
    "provider_error",
    "discord_handle_taken",
    "twitch_handle_taken",
])

const KNOWN_PROVIDERS: ReadonlySet<AuthProvider> = new Set([
    "discord",
    "twitch",
])

interface OAuthLoginMessage {
    type: "oauth_login"
    status: "ok" | "error" | "cancelled"
    reason: string
    provider: string
}

function isOAuthLoginMessage(value: unknown): value is OAuthLoginMessage {
    if (!value || typeof value !== "object") return false
    const v = value as Record<string, unknown>
    return v.type === "oauth_login"
        && (v.status === "ok" || v.status === "error" || v.status === "cancelled")
        && typeof v.reason === "string"
        && typeof v.provider === "string"
}

function narrowPopupReason(raw: string): OAuthLoginErrorReason {
    return KNOWN_POPUP_REASONS.has(raw as OAuthLoginErrorReason)
        ? (raw as OAuthLoginErrorReason)
        : "provider_error"
}

export async function runOAuthLogin(
    provider: AuthProvider,
    turnstileToken: string | null = null,
): Promise<OAuthLoginResult> {
    const popup = window.open(
        "about:blank",
        "oauth_login",
        "width=520,height=720,resizable=yes,scrollbars=yes",
    )
    if (!popup || popup.closed) {
        return { ok: false, reason: "popup_blocked" }
    }

    let initiate: { authorize_url: string }
    try {
        initiate = await initiateOAuthLoginFn(provider, turnstileToken)
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

    return new Promise<OAuthLoginResult>((resolve) => {
        let settled = false

        const finish = (result: OAuthLoginResult) => {
            if (settled) return
            settled = true
            window.removeEventListener("message", onMessage)
            clearInterval(pollId)
            if (!popup.closed) popup.close()
            resolve(result)
        }

        const onMessage = (event: MessageEvent) => {
            if (event.origin !== BACKEND_ORIGIN) return
            if (!isOAuthLoginMessage(event.data)) return
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
