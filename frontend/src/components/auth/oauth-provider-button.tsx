import type { ComponentProps, ReactNode } from "react"
import { SiDiscord, SiTwitch } from "@icons-pack/react-simple-icons"
import { useQueryClient } from "@tanstack/react-query"
import { ALLAUTH_API_URL } from "@/constants"
import { Button } from "@/components/ui/button"
import { getCsrfToken } from "@/lib/api-client"
import { stashConnectPreState } from "@/lib/oauth-flow"
import { stashRememberMe } from "@/lib/remember-me"
import { cn } from "@/lib/utils"

type Provider = "discord" | "twitch"
type Process = "login" | "connect"

const PROVIDER_ICON: Record<Provider, typeof SiDiscord> = {
    discord: SiDiscord,
    twitch: SiTwitch,
}

const PROVIDER_BRAND: Record<Provider, string> = {
    discord: "#5865F2",
    twitch: "#9146FF",
}

interface Props {
    provider: Provider
    process: Process
    callbackPath: string
    children: ReactNode
    size?: ComponentProps<typeof Button>["size"]
    fullWidth?: boolean
    rememberMe?: boolean
}

function buildCallbackUrl(callbackPath: string, process: Process): string {
    const url = new URL(callbackPath, window.location.origin)
    url.searchParams.set("proc", process)
    return url.toString()
}

export function OAuthProviderButton({
    provider,
    process,
    callbackPath,
    children,
    size,
    fullWidth = false,
    rememberMe = false,
}: Props) {
    const qc = useQueryClient()
    const action = `${ALLAUTH_API_URL}/auth/provider/redirect`
    const callbackUrl = buildCallbackUrl(callbackPath, process)
    const Icon = PROVIDER_ICON[provider]

    const handleSubmit = () => {
        if (rememberMe) {
            stashRememberMe(true)
        }
        if (process === "connect") {
            stashConnectPreState(qc)
        }
    }

    return (
        <form
            method="POST"
            action={action}
            className={cn(fullWidth && "w-full")}
            onSubmit={handleSubmit}
        >
            <input type="hidden" name="provider" value={provider} />
            <input type="hidden" name="process" value={process} />
            <input type="hidden" name="callback_url" value={callbackUrl} />
            <input
                type="hidden"
                name="csrfmiddlewaretoken"
                value={getCsrfToken()}
            />
            <Button
                type="submit"
                variant="outline"
                size={size}
                className={cn(fullWidth && "w-full")}
            >
                <Icon
                    size={16}
                    color={PROVIDER_BRAND[provider]}
                    className="mr-1"
                />
                {children}
            </Button>
        </form>
    )
}
