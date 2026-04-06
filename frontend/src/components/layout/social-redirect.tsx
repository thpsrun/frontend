import { useEffect } from "react"
import { useNavbar } from "@/hooks/home/useNavbar"

interface SocialRedirectProps {
    platform: string
}

export function SocialRedirect({ platform }: SocialRedirectProps) {
    const { data, isLoading } = useNavbar()

    useEffect(() => {
        if (!data?.social) return
        const link = data.social.find(
            s => s.platform.toLowerCase() === platform.toLowerCase(),
        )
        if (link) {
            window.location.replace(link.url)
        }
    }, [data, platform])

    if (isLoading) {
        return (
            <div className="flex justify-center pt-12 text-sm text-muted-foreground">
                Redirecting...
            </div>
        )
    }

    if (data && !data.social.find(
        s => s.platform.toLowerCase() === platform.toLowerCase(),
    )) {
        return (
            <div className="flex justify-center pt-12 text-sm text-muted-foreground">
                Link Not Found?
            </div>
        )
    }

    return (
        <div className="flex justify-center pt-12 text-sm text-muted-foreground">
            Redirecting...
        </div>
    )
}
