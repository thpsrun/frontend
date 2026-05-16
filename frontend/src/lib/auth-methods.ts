import type { AuthMethodsSummary, AuthProvider } from "@/types/auth"

export function canRemovePassword(m: AuthMethodsSummary): boolean {
    return m.has_usable_password && (
        m.social_accounts.length > 0
        || m.authenticators.some((a) => a.type === "webauthn")
    )
}

export function canDisconnectSocial(
    m: AuthMethodsSummary,
    provider: AuthProvider,
): boolean {
    const remainingSocial = m.social_accounts.filter(
        (s) => s.provider !== provider,
    ).length
    const hasPasskey = m.authenticators.some((a) => a.type === "webauthn")
    return m.has_usable_password || remainingSocial > 0 || hasPasskey
}

export function canRemovePasskey(
    m: AuthMethodsSummary,
    authenticatorId: number,
): boolean {
    const remainingPasskeys = m.authenticators.filter(
        (a) => a.type === "webauthn" && a.id !== authenticatorId,
    ).length
    return m.has_usable_password
        || m.social_accounts.length > 0
        || remainingPasskeys > 0
}
