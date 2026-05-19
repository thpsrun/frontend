import type {
    Authenticator,
    AuthMethodsSummary,
    AuthProvider,
} from "@/types/auth"

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

// Uses the allauth-sourced passkey list, since its ids are the ones we'd
// pass to the delete endpoint. The v1 methods list is still consulted for
// alternative auth (password, socials).
export function canRemovePasskey(
    m: AuthMethodsSummary,
    passkeys: ReadonlyArray<Authenticator>,
    thisId: string,
): boolean {
    const remaining = passkeys.filter(
        (p) => p.type === "webauthn" && p.id !== thisId,
    ).length
    return m.has_usable_password
        || m.social_accounts.length > 0
        || remaining > 0
}
