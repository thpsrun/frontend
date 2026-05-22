import { ApiError } from "@/lib/api-client"
import { BACKEND_URL } from "@/constants"
import { initiateOAuthReauthFn } from "@/hooks/auth/oauth-reauth-api"
import type { AuthProvider } from "@/types/auth"

const BACKEND_ORIGIN = new URL(BACKEND_URL).origin

export type OAuthReauthErrorReason =
    | "not_authenticated"
    | "user_mismatch"
    | "intent_expired"
    | "provider_mismatch"
    | "account_mismatch"
    | "provider_error"
    | "cancelled"
    | "popup_blocked"
    | "initiate_rate_limited"
    | "initiate_failed"

export type OAuthReauthResult =
    | { ok: true }
    | { ok: false, reason: OAuthReauthErrorReason }

const KNOWN_REASONS: ReadonlySet<OAuthReauthErrorReason> = new Set([
    "not_authenticated",
    "user_mismatch",
    "intent_expired",
    "provider_mismatch",
    "account_mismatch",
    "provider_error",
])

interface OAuthReauthMessage {
    type: "oauth_reauth"
    status: "ok" | "error" | "cancelled"
    reason: string
}

function isOAuthReauthMessage(value: unknown): value is OAuthReauthMessage {
    if (!value || typeof value !== "object") return false
    const v = value as Record<string, unknown>
    return v.type === "oauth_reauth"
        && (v.status === "ok" || v.status === "error" || v.status === "cancelled")
        && typeof v.reason === "string"
}

function narrowReason(raw: string): OAuthReauthErrorReason {
    return KNOWN_REASONS.has(raw as OAuthReauthErrorReason)
        ? (raw as OAuthReauthErrorReason)
        : "provider_error"
}

export async function runOAuthReauth(
    provider: AuthProvider,
): Promise<OAuthReauthResult> {
    // Open synchronously with about:blank to keep the user-gesture context;
    // navigating after an awaited fetch loses the gesture and trips popup blockers.
    const popup = window.open(
        "about:blank",
        "oauth_reauth",
        "width=520,height=720,resizable=yes,scrollbars=yes",
    )
    if (!popup || popup.closed) {
        return { ok: false, reason: "popup_blocked" }
    }

    let initiate: { authorize_url: string }
    try {
        initiate = await initiateOAuthReauthFn(provider)
    } catch (err) {
        popup.close()
        if (err instanceof ApiError && err.isRateLimited) {
            return { ok: false, reason: "initiate_rate_limited" }
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

    return new Promise<OAuthReauthResult>((resolve) => {
        let settled = false

        const finish = (result: OAuthReauthResult) => {
            if (settled) return
            settled = true
            window.removeEventListener("message", onMessage)
            clearInterval(pollId)
            if (!popup.closed) popup.close()
            resolve(result)
        }

        const onMessage = (event: MessageEvent) => {
            if (event.origin !== BACKEND_ORIGIN) return
            if (!isOAuthReauthMessage(event.data)) return
            const { status, reason } = event.data
            if (status === "ok") {
                finish({ ok: true })
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
