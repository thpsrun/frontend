import { ApiError } from "@/lib/api-client"
import { BACKEND_URL } from "@/constants"
import { initiateOAuthConnectFn } from "@/hooks/auth/oauth-connect-api"
import type { AuthProvider } from "@/types/auth"

const BACKEND_ORIGIN = new URL(BACKEND_URL).origin

export type OAuthConnectErrorReason =
    | "not_authenticated"
    | "user_mismatch"
    | "intent_expired"
    | "provider_mismatch"
    | "already_linked"
    | "account_taken"
    | "provider_error"
    | "cancelled"
    | "popup_blocked"
    | "initiate_rate_limited"
    | "initiate_already_linked"
    | "initiate_unsupported_provider"
    | "initiate_failed"

export type OAuthConnectResult =
    | { ok: true, provider: AuthProvider }
    | { ok: false, reason: OAuthConnectErrorReason }

const KNOWN_REASONS: ReadonlySet<OAuthConnectErrorReason> = new Set([
    "not_authenticated",
    "user_mismatch",
    "intent_expired",
    "provider_mismatch",
    "already_linked",
    "account_taken",
    "provider_error",
])

const KNOWN_PROVIDERS: ReadonlySet<AuthProvider> = new Set([
    "discord",
    "twitch",
])

interface OAuthConnectMessage {
    type: "oauth_connect"
    status: "ok" | "error" | "cancelled"
    reason: string
    provider: string
}

function isOAuthConnectMessage(value: unknown): value is OAuthConnectMessage {
    if (!value || typeof value !== "object") return false
    const v = value as Record<string, unknown>
    return v.type === "oauth_connect"
        && (v.status === "ok" || v.status === "error" || v.status === "cancelled")
        && typeof v.reason === "string"
        && typeof v.provider === "string"
}

function narrowReason(raw: string): OAuthConnectErrorReason {
    return KNOWN_REASONS.has(raw as OAuthConnectErrorReason)
        ? (raw as OAuthConnectErrorReason)
        : "provider_error"
}

export async function runOAuthConnect(
    provider: AuthProvider,
): Promise<OAuthConnectResult> {
    const popup = window.open(
        "about:blank",
        "oauth_connect",
        "width=520,height=720,resizable=yes,scrollbars=yes",
    )
    if (!popup || popup.closed) {
        return { ok: false, reason: "popup_blocked" }
    }

    let initiate: { authorize_url: string }
    try {
        initiate = await initiateOAuthConnectFn(provider)
    } catch (err) {
        popup.close()
        if (err instanceof ApiError) {
            if (err.isRateLimited) {
                return { ok: false, reason: "initiate_rate_limited" }
            }
            if (err.code === "already_linked") {
                return { ok: false, reason: "initiate_already_linked" }
            }
            if (err.code === "unsupported_provider") {
                return { ok: false, reason: "initiate_unsupported_provider" }
            }
        }
        return { ok: false, reason: "initiate_failed" }
    }

    // authorize_url is absolute (points at the provider's OAuth endpoint).
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

    return new Promise<OAuthConnectResult>((resolve) => {
        let settled = false

        const finish = (result: OAuthConnectResult) => {
            if (settled) return
            settled = true
            window.removeEventListener("message", onMessage)
            clearInterval(pollId)
            if (!popup.closed) popup.close()
            resolve(result)
        }

        const onMessage = (event: MessageEvent) => {
            if (event.origin !== BACKEND_ORIGIN) return
            if (!isOAuthConnectMessage(event.data)) return
            const { status, reason, provider: msgProvider } = event.data
            if (status === "ok") {
                const resolved = KNOWN_PROVIDERS.has(msgProvider as AuthProvider)
                    ? (msgProvider as AuthProvider)
                    : provider
                finish({ ok: true, provider: resolved })
            } else if (status === "cancelled") {
                finish({ ok: false, reason: "cancelled" })
            } else {
                finish({ ok: false, reason: narrowReason(reason) })
            }
        }

        const pollId = window.setInterval(() => {
            if (popup.closed) finish({ ok: false, reason: "cancelled" })
        }, 500)

        window.addEventListener("message", onMessage)
    })
}
