export interface Country {
    id: string
    name: string
    flag: string | null
}

export interface Gradients {
    gradient_1: string | null
    gradient_2: string | null
    gradient_3: string | null
}

export interface Socials {
    twitch: string | null
    youtube: string | null
    twitter: string | null
    bluesky: string | null
    discord: string | null
    therun_gg: string | null
}

export interface Customizations extends Gradients {
    tagline: string | null
    profile_bg: string | null
}

export interface ModeratedGame {
    id: string
    name: string
    slug: string
}
