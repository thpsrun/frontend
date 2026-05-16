import { useState } from "react"
import { SiDiscord, SiTwitch } from "@icons-pack/react-simple-icons"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import { useDisconnectSocialAccount } from "@/hooks/auth/useDisconnectSocialAccount"
import { canDisconnectSocial } from "@/lib/auth-methods"
import { OAuthProviderButton } from "@/components/auth/oauth-provider-button"
import { Button } from "@/components/ui/button"
import { SectionPanel } from "@/components/profile/section-panel"
import { cn } from "@/lib/utils"
import type { AuthProvider } from "@/types/auth"
import { DisconnectProviderDialog } from "./disconnect-provider-dialog"

const PROVIDERS = [
    { id: "discord" as AuthProvider, label: "Discord", Icon: SiDiscord, color: "#5865F2" },
    { id: "twitch" as AuthProvider, label: "Twitch", Icon: SiTwitch, color: "#9146FF" },
] as const

const ROW_CLASS = cn(
    "flex items-center",
    "justify-between",
    "rounded-md",
    "border border-border/40",
    "px-4 py-3",
)

function rowLabel(
    providerId: AuthProvider,
    socialsValue: string | null,
    fallback: string | null,
): string {
    if (socialsValue) {
        if (providerId === "twitch") {
            const match = socialsValue.match(/twitch\.tv\/([^/?#]+)/i)
            return match ? match[1] : socialsValue
        }
        return socialsValue
    }
    return fallback ?? ""
}

export function ConnectedAccountsSection() {
    const { player } = useCurrentPlayer()
    const { data: methods } = useAuthMethods()
    const disconnect = useDisconnectSocialAccount()
    const [target, setTarget] = useState<{
        providerId: AuthProvider
        label: string
    } | null>(null)

    const linked = methods?.social_accounts ?? []
    const socials = player?.socials

    const handleConfirm = () => {
        if (!target) return
        disconnect.mutate(target.providerId, {
            onSuccess: () => setTarget(null),
        })
    }

    return (
        <SectionPanel
            title="Connected Accounts"
            description="Link Discord or Twitch so you can sign in with one click!"
        >
            <div className="flex flex-col gap-3">
                {PROVIDERS.map(({ id, label, Icon, color }) => {
                    const acct = linked.find((l) => l.provider === id)
                    const canDisconnect = methods
                        ? canDisconnectSocial(methods, id)
                        : false
                    return (
                        <div key={id} className="flex flex-col gap-1">
                            <div className={ROW_CLASS}>
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Icon size={18} color={color} />
                                    {label}
                                    {acct && (
                                        <span className="text-muted-foreground font-normal">
                                            connected as{" "}
                                            {rowLabel(
                                                id,
                                                socials?.[id] ?? null,
                                                acct.username,
                                            )}
                                        </span>
                                    )}
                                </span>
                                {acct ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            disconnect.isPending
                                            || !canDisconnect
                                        }
                                        onClick={() =>
                                            setTarget({ providerId: id, label })
                                        }
                                    >
                                        Disconnect
                                    </Button>
                                ) : (
                                    <OAuthProviderButton
                                        provider={id}
                                        process="connect"
                                        callbackPath="/oauth/callback"
                                        size="sm"
                                    >
                                        Connect
                                    </OAuthProviderButton>
                                )}
                            </div>
                            {acct && !canDisconnect && (
                                <p className="px-1 text-xs text-muted-foreground">
                                    Add another sign-in method first.
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
            <DisconnectProviderDialog
                open={target !== null}
                onOpenChange={(open) => {
                    if (!open) setTarget(null)
                }}
                onConfirm={handleConfirm}
                isPending={disconnect.isPending}
                providerLabel={target?.label ?? ""}
            />
        </SectionPanel>
    )
}
