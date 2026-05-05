import type { Game } from "./api"
import type { Country, Gradients } from "./shared"

export interface Tag {
    id?: number
    name: string
    slug: string
    description: string
}

export interface GuideAuthor {
    name: string
    nickname: string | null
    country: Country | null
    gradients?: Gradients | null
}

export interface GuideListItem {
    title: string
    slug: string
    short_description: string
    created_at: string | null
    updated_at: string | null
    game?: Game | null
    tags?: Tag[] | null
    author?: GuideAuthor | null
    can_edit?: boolean
}

export interface Guide extends GuideListItem {
    content: string
}

export interface GuideCreateInput {
    title: string
    game_id: string
    tag_ids: string[]
    short_description: string
    content: string
}

export interface GuideUpdateInput {
    title?: string
    slug?: string
    game_id?: string
    tag_ids?: string[]
    short_description?: string
    content?: string
}

export interface TagCreateInput {
    name: string
    description: string
}

export interface TagUpdateInput {
    name?: string
    slug?: string
    description?: string
}
