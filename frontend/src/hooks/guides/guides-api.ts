import { apiFetch } from "@/lib/api-client"
import { buildQueryString } from "@/lib/utils"
import type {
    Guide,
    GuideCreateInput,
    GuideListItem,
    GuideUpdateInput,
} from "@/types/guides"

export const LIST_EMBED = "game,tags"
export const DETAIL_EMBED = "game,tags"

interface ListParams {
    game?: string
    tag?: string
    player_id?: string
    embed?: string
}

export const listGuidesFn = (
    params: ListParams,
    signal?: AbortSignal,
): Promise<GuideListItem[]> =>
    apiFetch<GuideListItem[]>(`/guides/all${buildQueryString(params)}`, { signal })

const guidePath = (gameSlug: string, slug: string): string =>
    `/guides/${encodeURIComponent(gameSlug)}/${encodeURIComponent(slug)}`

export const getGuideFn = (
    gameSlug: string,
    slug: string,
    embed: string | undefined,
    signal?: AbortSignal,
): Promise<Guide> =>
    apiFetch<Guide>(
        `${guidePath(gameSlug, slug)}${buildQueryString({ embed })}`,
        { signal },
    )

export const createGuideFn = (data: GuideCreateInput): Promise<Guide> =>
    apiFetch<Guide>("/guides/", { method: "POST", json: data })

export const updateGuideFn = (
    gameSlug: string,
    slug: string,
    data: GuideUpdateInput,
): Promise<Guide> =>
    apiFetch<Guide>(guidePath(gameSlug, slug), {
        method: "PUT",
        json: data,
    })

export const deleteGuideFn = (gameSlug: string, slug: string): Promise<void> =>
    apiFetch<void>(guidePath(gameSlug, slug), { method: "DELETE" })
