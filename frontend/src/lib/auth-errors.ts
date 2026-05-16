export type DeletePasswordMode = "password" | "mfa"

export function mapDeletePasswordError(
    code: string | null,
    mode: DeletePasswordMode,
): string {
    switch (code) {
        case "reauth_required":
            return mode === "password"
                ? "Wrong password. Try again."
                : "That code didn't work. Try again."
        case "no_alternative_auth":
            return "You need another sign-in method first. Add a passkey or link Discord/Twitch."
        case "webauthn_reauth_not_implemented":
            return "WebAuthn re-authentication isn't available yet."
        default:
            return "Couldn't remove password. Please try again."
    }
}

export interface DisconnectSocialErrorResult {
    silent: boolean
    toast: string | null
}

export function mapDisconnectSocialError(
    code: string | null,
): DisconnectSocialErrorResult {
    switch (code) {
        case "last_auth_method":
            return {
                silent: false,
                toast: "That's your only way to sign in. Add another first.",
            }
        case "no_social_account":
            return { silent: true, toast: null }
        default:
            return {
                silent: false,
                toast: "Couldn't disconnect. Please try again.",
            }
    }
}
