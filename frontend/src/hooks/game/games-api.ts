import { apiFetch } from "@/lib/api-client"
import type { Game } from "@/types/api"
import type { TimingMethodType } from "@/types/shared"

export interface UpdateGameRequest {
    defaulttime?: TimingMethodType
    idefaulttime?: TimingMethodType
    allowed_methods_fg?: TimingMethodType[]
    allowed_methods_il?: TimingMethodType[]
    required_methods_fg?: TimingMethodType[]
    required_methods_il?: TimingMethodType[]
    rules?: string | null
    release?: string | null
}

export const updateGameFn = (
    slug: string,
    body: UpdateGameRequest,
): Promise<Game> =>
    apiFetch<Game>(`/games/${slug}`, {
        method: "PUT",
        json: body,
    })
