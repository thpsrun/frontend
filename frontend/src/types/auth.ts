export interface AuthPlayerProfile {
    username: string
    name: string
    nickname: string | null
    pronouns: string | null
    country: { id: string; name: string; flag: string | null } | null
    pfp: string | null
    is_superuser: boolean
    ex_stream: boolean
}

export interface AuthPlayerSocials {
    twitch: string | null
    youtube: string | null
    twitter: string | null
    bluesky: string | null
    discord: string | null
    therun_gg: string | null
}

export interface AuthPlayerCustomizations {
    bio: string | null
    short_bio: string | null
    gradient_1: string | null
    gradient_2: string | null
    gradient_3: string | null
    profile_bg: string | null
}

export interface AuthPlayerModeration {
    has_src_key: boolean
    moderated_games: ModeratedGame[]
}

export interface AuthPlayer {
    player_id: string
    claim_status: string
    joined: string | null
    player: AuthPlayerProfile
    socials: AuthPlayerSocials
    customizations: AuthPlayerCustomizations
    moderation: AuthPlayerModeration
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

export interface UpdateProfileRequest {
    player?: {
        name?: string
        nickname?: string | null
        pronouns?: string | null
        country?: string
        ex_stream?: boolean
    }
    socials?: {
        twitch?: string | null
        youtube?: string | null
        twitter?: string | null
        bluesky?: string | null
        therun_gg?: string | null
    }
    customizations?: {
        bio?: string | null
        short_bio?: string | null
        gradient_1?: string | null
        gradient_2?: string | null
        gradient_3?: string | null
    }
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
