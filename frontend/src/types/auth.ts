export interface CountryEmbed {
    id: string
    name: string
    flag: string | null
}

export interface PlayerEmbed {
    username: string
    name: string
    nickname: string | null
    pronouns: string | null
    country: CountryEmbed | null
    pfp: string | null
    is_superuser: boolean
    ex_stream: boolean
}

export interface SocialsEmbed {
    twitch: string | null
    youtube: string | null
    twitter: string | null
    bluesky: string | null
    discord: string | null
    therun_gg: string | null
}

export interface CustomizationsEmbed {
    tagline: string | null
    gradient_1: string | null
    gradient_2: string | null
    gradient_3: string | null
    profile_bg: string | null
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
    socials: SocialsEmbed
    customizations: CustomizationsEmbed
    moderation: ModerationEmbed
}

export interface VerifySrcRequest {
    src_api_key: string
}

export interface ModeratedGame {
    id: string
    name: string
    slug: string
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

export interface AuthError {
    error: string
    details: Record<string, string> | null
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

export interface AllauthError {
    message: string
    code: string
    param?: string
}

export interface AllauthErrorResponse {
    status: number
    errors: AllauthError[]
}

export interface Country {
    id: string
    name: string
    flag: string | null
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
