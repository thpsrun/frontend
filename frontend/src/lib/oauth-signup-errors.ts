import type { OauthSignupErrorCode } from "@/types/auth"

const FINALIZE_ERROR_TABLE: Record<OauthSignupErrorCode, string> = {
    src_invalid: "We couldn't verify that SRC API key. Double-check and try again.",
    src_unreachable: "Couldn't reach Speedrun.com. Try again in a moment.",
    username_taken: "That username is already taken.",
    email_taken: "That email is already in use.",
    discord_handle_taken: "Another thps.run user is already using that Discord handle.",
    twitch_handle_taken: "Another thps.run user is already using that Twitch handle.",
    src_player_not_found: "We couldn't find your SRC profile in our database. Make sure you have a verified run, then try again.",
    src_player_already_claimed: "That SRC player is already linked to another thps.run account.",
    no_verified_run: "You need at least one verified run on SRC before signing up.",
}

const UNKNOWN_FINALIZE_MESSAGE = "Something went wrong. Please try again."

export const EMAIL_TAKEN_PROVIDER_MESSAGE =
    "An account with this email already exists. Try logging in."

export const EMAIL_TAKEN_TYPED_MESSAGE =
    "That email is already in use. Try a different one."

export function mapFinalizeSignupError(code: string | null): string {
    if (code !== null && code in FINALIZE_ERROR_TABLE) {
        return FINALIZE_ERROR_TABLE[code as OauthSignupErrorCode]
    }
    return UNKNOWN_FINALIZE_MESSAGE
}
