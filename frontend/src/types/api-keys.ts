export type ApiKeyResponse = {
    id: string
    label: string
    description: string
    prefix: string
    scope_capabilities: string[]
    scope_games: string[]
    created: string
    expiry_date: string | null
    last_used: string | null
    last_used_ip: string | null
    revoked: boolean
    revoked_reason: "" | "user" | "permission_revoked" | "admin"
    revoked_at: string | null
}

export type ApiKeyCreateResponse = ApiKeyResponse & {
    key: string
}

export type ApiKeyExpiryDays = 30 | 90 | 180 | 365

export type ApiKeyCreateRequest = {
    label: string
    description?: string
    expiry_days: ApiKeyExpiryDays
    scope_capabilities?: string[]
    scope_games?: string[]
}

export type ApiKeyPatchRequest = {
    label?: string
    description?: string
}

export type CapabilityGame = {
    id: string
    name: string
    slug: string
}

export type CapabilitiesResponse = {
    capabilities: string[]
    games: CapabilityGame[]
}
