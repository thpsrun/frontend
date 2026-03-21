// Response from GET /api/v1/auth/me
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
    pfp: string | null
    is_claimed: boolean
    username: string
    is_moderator: boolean
    has_src_key: boolean
    moderated_games: ModeratedGame[]
}

// Request types
export interface VerifySrcRequest {
    src_api_key: string
}

export interface VerifySrcResponse {
    player_id: string
    player_name: string
}

// Moderation types
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

// Custom endpoint error shape (/api/v1/auth/)
export interface AuthError {
    error: string
    details: Record<string, string> | null
}

// Allauth response shapes
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

// Country option from GET /api/v1/auth/countries
export interface Country {
    id: string
    name: string
}

// Profile update request - all fields optional (PATCH /api/v1/auth/me)
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
}

// Password change request (allauth)
export interface ChangePasswordRequest {
    current_password: string
    new_password: string
}

// PFP upload response
export interface PfpResponse {
    pfp: string
}

// Normalized session state used by useAuth
export interface SessionState {
    isAuthenticated: boolean
    user?: AllauthUser
}
