import type { OauthSignupErrorCode } from "@/types/auth"

export interface OauthSignupError {
    message: string
    recoverable: boolean
}

const ERROR_TABLE: Record<OauthSignupErrorCode, OauthSignupError> = {
    src_invalid: {
        message: "We couldn't verify that SRC API key. Double-check and try again.",
        recoverable: true,
    },
    src_unreachable: {
        message: "Couldn't reach Speedrun.com. Try again in a moment.",
        recoverable: true,
    },
    username_taken: {
        message: "That username is already taken.",
        recoverable: true,
    },
    email_taken: {
        message: "That email is already in use.",
        recoverable: true,
    },
    discord_handle_taken: {
        message: "Another thps.run user is already displaying that Discord handle. Rename on Discord or contact support.",
        recoverable: false,
    },
    twitch_handle_taken: {
        message: "Another thps.run user is already displaying that Twitch handle. Rename on Twitch or contact support.",
        recoverable: false,
    },
    src_player_not_found: {
        message: "We couldn't find your SRC profile in our database. Make sure you have a verified run, then try again.",
        recoverable: false,
    },
    src_player_already_claimed: {
        message: "That SRC player is already linked to another thps.run account.",
        recoverable: false,
    },
    no_verified_run: {
        message: "You need at least one verified run on SRC before signing up.",
        recoverable: false,
    },
}

const UNKNOWN_ERROR: OauthSignupError = {
    message: "Something went wrong. Please try again.",
    recoverable: true,
}

export function mapOauthSignupError(code: string | null): OauthSignupError {
    if (code !== null && code in ERROR_TABLE) {
        return ERROR_TABLE[code as OauthSignupErrorCode]
    }
    return UNKNOWN_ERROR
}
