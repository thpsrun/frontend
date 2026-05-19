import type { ComponentProps, ReactNode, SyntheticEvent } from "react"
import { SiDiscord, SiTwitch } from "@icons-pack/react-simple-icons"
import { useQueryClient } from "@tanstack/react-query"
import { ALLAUTH_API_URL } from "@/constants"
import { Button } from "@/components/ui/button"
import { getCsrfToken } from "@/lib/api-client"
import { stashConnectPreState, stashSignupDraft } from "@/lib/oauth-flow"
import { stashRememberMe } from "@/lib/remember-me"
import { cn } from "@/lib/utils"
import type { AuthProvider, OauthSignupDraft } from "@/types/auth"

type Process = "login" | "connect" | "signup"

const PROVIDER_ICON: Record<AuthProvider, typeof SiDiscord> = {
    discord: SiDiscord,
    twitch: SiTwitch,
}

const PROVIDER_BRAND: Record<AuthProvider, string> = {
    discord: "#5865F2",
    twitch: "#9146FF",
}

interface Props {
    provider: AuthProvider
    process: Process
    callbackPath: string
    children: ReactNode
    size?: ComponentProps<typeof Button>["size"]
    fullWidth?: boolean
    rememberMe?: boolean
    signupDraft?: OauthSignupDraft
    onBeforeSubmit?: () => boolean
}

function resolveBackendProcess(p: Process): "login" | "connect" {
    return p === "connect" ? "connect" : "login"
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
    signupDraft,
    onBeforeSubmit,
}: Props) {
    const qc = useQueryClient()
    const action = `${ALLAUTH_API_URL}/auth/provider/redirect`
    const callbackUrl = buildCallbackUrl(callbackPath, process)
    const backendProcess = resolveBackendProcess(process)
    const Icon = PROVIDER_ICON[provider]

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        if (onBeforeSubmit && !onBeforeSubmit()) {
            e.preventDefault()
            return
        }
        if (rememberMe) {
            stashRememberMe(true)
        }
        if (process === "connect") {
            stashConnectPreState(qc)
        }
        if (process === "signup") {
            if (!signupDraft) {
                e.preventDefault()
                return
            }
            stashSignupDraft(signupDraft)
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
            <input type="hidden" name="process" value={backendProcess} />
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
