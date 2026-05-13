export interface NavbarAdminItem {
    id: number
    name: string
    url: string | null
    parent_id: number | null
    order: number
    is_visible: boolean
    children: NavbarAdminItem[]
}

export interface NavbarAdminSocial {
    id: number
    platform: string
    url: string
    order: number
    is_visible: boolean
}

export interface NavbarStateResponse {
    items: NavbarAdminItem[]
    social: NavbarAdminSocial[]
}

export interface NavItemCreate {
    name: string
    url?: string | null
    parent_id?: number | null
    order?: number
    is_visible?: boolean
}

export interface NavItemUpdate {
    name?: string
    url?: string | null
    parent_id?: number | null
    order?: number
    is_visible?: boolean
}

export interface NavItemReorderRequest {
    parent_id: number | null
    ordered_ids: number[]
}

export interface SocialLinkCreate {
    platform: string
    url: string
    order?: number
    is_visible?: boolean
}

export interface SocialLinkUpdate {
    platform?: string
    url?: string
    order?: number
    is_visible?: boolean
}

export interface SocialReorderRequest {
    ordered_ids: number[]
}
