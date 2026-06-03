const COOKIE_CONSENT_KEY = "thps:cookie-consent"
const COOKIE_CONSENT_VERSION = "v1"

export function hasAcknowledgedCookies(): boolean {
    try {
        return localStorage.getItem(COOKIE_CONSENT_KEY) === COOKIE_CONSENT_VERSION
    } catch {
        return false
    }
}

export function acknowledgeCookies(): void {
    try {
        localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION)
    } catch {
        // 
    }
}
