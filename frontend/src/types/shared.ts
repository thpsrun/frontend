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

export type StatusMsg = {
    type: "success" | "error"
    text: string
} | null

export type TimingMethodType = "rta" | "lrt" | "igt"

export const TIMING_METHOD_LABELS: Record<TimingMethodType, string> = {
    rta: "Real Time",
    lrt: "Real Time (No Loads)",
    igt: "In-Game Time",
}

export const ALL_TIMING_METHODS: readonly TimingMethodType[] = [
    "rta",
    "lrt",
    "igt",
] as const
