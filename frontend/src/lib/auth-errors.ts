import type { OAuthConnectErrorReason } from "@/lib/oauth-connect"
import type { OAuthReauthErrorReason } from "@/lib/oauth-reauth"
import type { OAuthSignupErrorReason } from "@/lib/oauth-signup"
import type { OAuthLoginErrorReason } from "@/lib/oauth-login"

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

export function oauthReauthErrorMessage(
    reason: OAuthReauthErrorReason,
    providerLabel: string,
): string {
    switch (reason) {
        case "not_authenticated":
            return "Your session expired. Please log in again."
        case "user_mismatch":
            return "Something went wrong. Please refresh and try again."
        case "intent_expired":
            return "Verification timed out. Try again."
        case "provider_mismatch":
            return "Verification failed. Please try again."
        case "account_mismatch":
            return `That doesn't match your linked ${providerLabel}. `
                + `Use the same account that's linked to your profile.`
        case "provider_error":
            return `${providerLabel} rejected the request. Please try again.`
        case "cancelled":
            return "Verification was cancelled..."
        case "popup_blocked":
            return "Popup was blocked. Allow popups for this site and try again."
        case "initiate_rate_limited":
            return "Too many attempts. Try again in a minute."
        case "initiate_failed":
            return "Couldn't start verification. Please try again."
    }
}

export function oauthConnectErrorMessage(
    reason: OAuthConnectErrorReason,
    providerLabel: string,
): string {
    switch (reason) {
        case "not_authenticated":
            return "Your session expired. Please log in again."
        case "user_mismatch":
            return "Something went wrong. Please refresh and try again."
        case "intent_expired":
            return "Connect timed out. Try again."
        case "provider_mismatch":
            return "Connect failed. Please try again."
        case "already_linked":
        case "initiate_already_linked":
            return `${providerLabel} is already connected to your account.`
        case "account_taken":
            return `That ${providerLabel} account is already `
                + `connected to another profile.`
        case "provider_error":
            return `${providerLabel} rejected the request. Please try again.`
        case "cancelled":
            return "Connect cancelled."
        case "popup_blocked":
            return "Popup was blocked. Allow popups for this site and try again."
        case "initiate_rate_limited":
            return "Too many attempts. Try again in a minute."
        case "initiate_unsupported_provider":
            return `${providerLabel} sign-in isn't available right now.`
        case "initiate_failed":
            return "Couldn't start the connect flow. Please try again."
    }
}

export function oauthSignupErrorMessage(
    reason: OAuthSignupErrorReason,
    providerLabel: string,
): string {
    switch (reason) {
        case "intent_expired":
            return "Signup timed out. Try again."
        case "provider_mismatch":
            return "Signup failed. Please try again."
        case "already_linked":
            return `That ${providerLabel} account is already linked to an existing thps.run profile.`
        case "provider_error":
            return `${providerLabel} rejected the request. Please try again.`
        case "discord_handle_taken":
            return "Another thps.run user is already using that Discord handle."
        case "twitch_handle_taken":
            return "Another thps.run user is already using that Twitch handle."
        case "signup_closed":
            return `Signup with ${providerLabel} isn't available right now.`
        case "cancelled":
            return "Signup cancelled."
        case "popup_blocked":
            return "Popup was blocked. Allow popups for this site and try again."
        case "initiate_unsupported_provider":
            return `${providerLabel} sign-up isn't available right now.`
        case "initiate_already_authenticated":
            return "You're already signed in."
        case "initiate_rate_limited":
            return "Too many attempts. Try again in a minute."
        case "initiate_failed":
            return "Couldn't start signup. Please try again."
    }
}

export function oauthLoginErrorMessage(
    reason: OAuthLoginErrorReason,
    providerLabel: string,
): string {
    switch (reason) {
        case "intent_expired":
            return "Login timed out. Try again."
        case "provider_mismatch":
            return "Login failed. Please try again."
        case "no_link":
            return `That ${providerLabel} account isn't linked to a thps.run profile.`
        case "banned":
            return "Your account has been disabled."
        case "provider_error":
            return `${providerLabel} rejected the request. Please try again.`
        case "discord_handle_taken":
            return "Another thps.run user is already using that Discord handle."
        case "twitch_handle_taken":
            return "Another thps.run user is already using that Twitch handle."
        case "cancelled":
            return "Login cancelled."
        case "popup_blocked":
            return "Popup was blocked. Allow popups for this site and try again."
        case "initiate_unsupported_provider":
            return `${providerLabel} login isn't available right now.`
        case "initiate_already_authenticated":
            return "You're already signed in."
        case "initiate_rate_limited":
            return "Too many attempts. Try again in a minute."
        case "initiate_failed":
            return "Couldn't start login. Please try again."
    }
}
