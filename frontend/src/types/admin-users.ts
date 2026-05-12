export interface AdminModeratedGame {
    game_id: string
    game_name: string
}

export interface AwardEntry {
    award_id: number
    award_name: string
}

export interface AdminPfpResponse {
    pfp: string
}

export interface SessionsRevokedResponse {
    revoked: number
}

export interface BanRequest {
    reason?: string | null
}
