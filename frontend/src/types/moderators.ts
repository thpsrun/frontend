import type { Gradients } from "./shared"

// Utilized on /api/v1/games/{gameSlug}?embed=moderators
export interface GameModerator {
    id: string
    name: string
    nickname: string | null
    url: string
    country_id: string | null
    pfp: string | null
    gradients: Gradients | null
}
