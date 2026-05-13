import { cn } from "@/lib/utils"
import { useNavbar } from "@/hooks/home/useNavbar"
import { getSocialPlatform } from "@/lib/social-platforms"

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
                const entry = getSocialPlatform(social.platform)
                if (!entry) return null
                const { Icon } = entry

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
