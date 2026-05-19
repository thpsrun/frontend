export function mapDeletePasswordError(code: string | null): string {
    switch (code) {
        case "no_alternative_auth":
            return "You need another sign-in method first. Add a passkey or link Discord/Twitch."
        default:
            return "Couldn't remove password. Please try again."
    }
}

export function mapReauthError(code: string | null): string {
    switch (code) {
        case "invalid_password":
        case "invalid":
            return "Wrong password. Try again."
        default:
            return "Re-authentication failed. Please try again."
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
