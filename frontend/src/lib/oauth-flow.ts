import type { QueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import type {
    AuthMethodsSocialAccount,
    AuthMethodsSummary,
    OauthSignupDraft,
} from "@/types/auth"

const OAUTH_CONNECT_STASH_KEY = "oauth.connect.preSocialAccounts"

export function stashConnectPreState(qc: QueryClient): void {
    const methods = qc.getQueryData<AuthMethodsSummary>(
        queryKeys.auth.methods(),
    )
    sessionStorage.setItem(
        OAUTH_CONNECT_STASH_KEY,
        JSON.stringify(methods?.social_accounts ?? []),
    )
}

export function consumeConnectStash(): AuthMethodsSocialAccount[] | null {
    const raw = sessionStorage.getItem(OAUTH_CONNECT_STASH_KEY)
    if (raw === null) return null
    sessionStorage.removeItem(OAUTH_CONNECT_STASH_KEY)
    try {
        return JSON.parse(raw) as AuthMethodsSocialAccount[]
    } catch {
        return null
    }
}

const OAUTH_SIGNUP_STASH_KEY = "oauth.signup.draft"

export function stashSignupDraft(draft: OauthSignupDraft): void {
    sessionStorage.setItem(
        OAUTH_SIGNUP_STASH_KEY,
        JSON.stringify(draft),
    )
}

export function peekSignupDraft(): OauthSignupDraft | null {
    const raw = sessionStorage.getItem(OAUTH_SIGNUP_STASH_KEY)
    if (raw === null) return null
    try {
        return JSON.parse(raw) as OauthSignupDraft
    } catch {
        return null
    }
}

export function consumeSignupDraft(): OauthSignupDraft | null {
    const draft = peekSignupDraft()
    if (draft !== null) {
        sessionStorage.removeItem(OAUTH_SIGNUP_STASH_KEY)
    }
    return draft
}
