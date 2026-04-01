export interface AuthPlayer {
    player_id: string
    name: string
    nickname: string | null
    pronouns: string | null
    countrycode: string
    twitch: string | null
    youtube: string | null
    twitter: string | null
    bluesky: string | null
    discord: string | null
    ex_stream: boolean
    pfp: string | null
    is_claimed: boolean
    username: string
    has_src_key: boolean
    moderated_games: ModeratedGame[]
    is_superuser: boolean
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
}

export interface UpdateProfileRequest {
    name?: string
    nickname?: string | null
    pronouns?: string | null
    countrycode?: string
    twitch?: string | null
    youtube?: string | null
    twitter?: string | null
    bluesky?: string | null
    discord?: string | null
    ex_stream?: boolean
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
