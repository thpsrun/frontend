import type { ComponentType } from "react"
import {
    SiBluesky,
    SiDiscord,
    SiTwitch,
    SiYoutube,
} from "@icons-pack/react-simple-icons"
import { FaTrophy } from "react-icons/fa6"

export interface SocialPlatform {
    platform: string
    Icon: ComponentType<{ className?: string }>
}

export const SOCIAL_PLATFORMS: ReadonlyArray<SocialPlatform> = [
    { platform: "YouTube", Icon: SiYoutube },
    { platform: "Twitch", Icon: SiTwitch },
    { platform: "Discord", Icon: SiDiscord },
    { platform: "BlueSky", Icon: SiBluesky },
    { platform: "Speedrun.com", Icon: FaTrophy },
]

const REGISTRY = new Map(
    SOCIAL_PLATFORMS.map((p) => [p.platform.toLowerCase(), p]),
)

export function getSocialPlatform(name: string): SocialPlatform | undefined {
    return REGISTRY.get(name.toLowerCase())
}

export function isKnownPlatform(name: string): boolean {
    return REGISTRY.has(name.toLowerCase())
}
