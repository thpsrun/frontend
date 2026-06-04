import type {
    Country,
    Customizations,
    ModeratedGame,
    Socials,
} from "./shared"

export type { Country } from "./shared"

export interface PlayerEmbed {
    username: string
    name: string
    nickname: string | null
    pronouns: string | null
    country: Country | null
    pfp: string | null
    is_superuser: boolean
    ex_stream: boolean
    email: string
    email_verified: boolean
    pending_email: string | null
}

export interface ModerationEmbed {
    has_src_key: boolean
    moderated_games: ModeratedGame[]
}

export interface AuthMe {
    player_id: string
    claim_status: string
    joined: string | null
    player: PlayerEmbed
    socials: Socials
    customizations: Customizations
    moderation: ModerationEmbed
}

export interface VerifySrcRequest {
    src_api_key: string
}

export interface SRCKeyStatusResponse {
    has_src_key: boolean
    message: string
}

export interface RegisterRequest {
    src_api_key: string
    save_key?: boolean
    username: string
    email: string
    password1: string
    password2: string
}

export interface RegisterResponse {
    player_id: string
    player_name: string
    username: string
}

export interface LoginRequest {
    username: string
    password: string
}

export interface AllauthUser {
    id: number
    username: string
    email: string
}

export interface AllauthFlow {
    id: string
    is_pending?: boolean
    [key: string]: unknown
}

export interface AllauthSessionResponse {
    status: number
    data: {
        user?: AllauthUser
        flows?: AllauthFlow[]
    }
}

export interface PlayerUpdateEmbed {
    nickname?: string | null
    pronouns?: string | null
    country?: string | null
    ex_stream?: boolean | null
}

export interface SocialsUpdateEmbed {
    youtube?: string | null
    twitter?: string | null
    bluesky?: string | null
    therun_gg?: string | null
}

export interface CustomizationsUpdateEmbed {
    tagline?: string | null
    gradient_1?: string | null
    gradient_2?: string | null
    gradient_3?: string | null
}

export interface UpdateProfileRequest {
    player?: PlayerUpdateEmbed
    socials?: SocialsUpdateEmbed
    customizations?: CustomizationsUpdateEmbed
}

export interface ProfileBgResponse {
    profile_bg: string | null
}

export interface ChangePasswordRequest {
    current_password?: string
    new_password: string
}

export interface PfpResponse {
    pfp: string
}

export interface SessionState {
    isAuthenticated: boolean
    user?: AllauthUser
    // Set when the session is in allauth's `mfa_authenticate` pending state (primary
    // auth done, second factor still required) -- e.g. after OAuth login for a TOTP user.
    mfaPending?: boolean
}

export interface RememberMeOption {
    rememberMe: boolean
}

export type LoginOptions = RememberMeOption
export type PasskeyLoginOptions = RememberMeOption

export interface LinkedProvider {
    uid: string
    display: string
    provider: { id: string; name: string }
}

export interface Authenticator {
    id: string
    type: "totp" | "webauthn" | "recovery_codes"
    name: string
    last_used_at: number | null
    created_at: number
}

export type AuthProvider = "discord" | "twitch"

export interface AuthMethodsSocialAccount {
    provider: AuthProvider
    uid: string
    username: string | null
    last_login: string | null
}

export interface AuthMethodsAuthenticator {
    type: "webauthn" | "totp"
    id: string
    name: string | null
    added_at: string
}

export interface AuthMethodsSummary {
    has_usable_password: boolean
    social_accounts: AuthMethodsSocialAccount[]
    authenticators: AuthMethodsAuthenticator[]
}

export interface TotpSetup {
    secret: string
    totpUrl: string
}

export interface RecoveryCodesGenerated {
    type: "recovery_codes"
    created_at: number
    last_used_at: number | null
    total_code_count: number
    unused_code_count: number
    unused_codes: string[]
}

export interface OauthSignupRequest {
    username: string
    email?: string
    src_api_key: string
    save_key: boolean
}

export type OauthSignupErrorCode =
    | "src_invalid"
    | "src_unreachable"
    | "username_taken"
    | "email_taken"
    | "discord_handle_taken"
    | "twitch_handle_taken"
    | "src_player_not_found"
    | "src_player_already_claimed"
    | "no_verified_run"

export interface VerificationRequiredResponse {
    status: "verification_required"
    email: string
    username: string
    src_user_id: string
}

export type RegisterResult = RegisterResponse | VerificationRequiredResponse

export interface EmailStatusResponse {
    email: string
    verified: boolean
    pending_email: string | null
    pending_expires_at: string | null
}

export interface EmailChangeResponse {
    status: "verification_sent"
    new_email: string
    expires_at: string | null
}

export interface CorrectEmailResponse {
    status: "verification_sent"
    email: string
}

export type SignupVerifyErrorCode =
    | "invalid_or_expired_code"
    | "rate_limited"

export type CorrectEmailErrorCode =
    | "src_api_unavailable"
    | "src_api_invalid"
    | "rate_limited"

export type EmailChangeErrorCode =
    | "same_email"
    | "reauth_required"
    | "email_taken"
    | "rate_limited"

export type VerifyEmailChangeErrorCode =
    | "invalid_or_expired_code"
    | "no_pending_change"
