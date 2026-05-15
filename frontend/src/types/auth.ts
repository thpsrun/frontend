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
    name?: string | null
    nickname?: string | null
    pronouns?: string | null
    country?: string | null
    ex_stream?: boolean | null
}

export interface SocialsUpdateEmbed {
    twitch?: string | null
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
    current_password: string
    new_password: string
}

export interface PfpResponse {
    pfp: string
}

export interface SessionState {
    isAuthenticated: boolean
    user?: AllauthUser
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
