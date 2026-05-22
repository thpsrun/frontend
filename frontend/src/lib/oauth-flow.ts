import type { OauthSignupDraft } from "@/types/auth"

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
