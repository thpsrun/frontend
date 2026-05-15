const REMEMBER_ME_STASH_KEY = "auth.rememberMe"

export function stashRememberMe(value: boolean): void {
    if (value) {
        sessionStorage.setItem(REMEMBER_ME_STASH_KEY, "1")
    } else {
        sessionStorage.removeItem(REMEMBER_ME_STASH_KEY)
    }
}

export function consumeRememberMeStash(): boolean {
    const value = sessionStorage.getItem(REMEMBER_ME_STASH_KEY) === "1"
    sessionStorage.removeItem(REMEMBER_ME_STASH_KEY)
    return value
}

export function peekRememberMeStash(): boolean {
    return sessionStorage.getItem(REMEMBER_ME_STASH_KEY) === "1"
}
