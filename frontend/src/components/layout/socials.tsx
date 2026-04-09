import type { ComponentType } from "react"
import {
    SiBluesky,
    SiDiscord,
    SiTwitch,
    SiYoutube,
} from "@icons-pack/react-simple-icons"
import { FaTrophy } from "react-icons/fa6"
import { cn } from "@/lib/utils"
import { useNavbar } from "@/hooks/home/useNavbar"

const platformIcons: Record<
    string,
    ComponentType<{ className?: string }>
> = {
    YouTube: SiYoutube,
    Twitch: SiTwitch,
    Discord: SiDiscord,
    Bluesky: SiBluesky,
    Speedrun: FaTrophy,
}

const socialIconClass = cn(
    "w-5 h-5 text-ring",
    "hover:text-white transition-colors",
    "duration-200 ease-in-out",
)

export const Socials = () => {
    const { data } = useNavbar()

    if (!data?.social) return null

    return (
        <div className="flex items-center space-x-4">
            {data.social.map(social => {
                const Icon = platformIcons[social.platform]
                if (!Icon) return null

                return (
                    <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Icon className={socialIconClass} />
                    </a>
                )
            })}
        </div>
    )
}
