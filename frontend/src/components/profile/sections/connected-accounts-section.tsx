import { useState } from "react"
import { SiDiscord, SiTwitch } from "@icons-pack/react-simple-icons"
import { toast } from "sonner"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import { useConnectSocialAccount } from "@/hooks/auth/useConnectSocialAccount"
import { canDisconnectSocial } from "@/lib/auth-methods"
import { oauthConnectErrorMessage } from "@/lib/auth-errors"
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

// Prefer the player's socials value over the allauth account username. Twitch socials are
// stored as a full twitch.tv URL, so extract just the channel name for display.
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
    const { connect, pending } = useConnectSocialAccount()
    const [target, setTarget] = useState<{
        providerId: AuthProvider
        label: string
    } | null>(null)

    const linked = methods?.social_accounts ?? []
    const socials = player?.socials

    const handleConnect = async (id: AuthProvider, label: string) => {
        const result = await connect(id)
        if (result.ok) {
            toast.success(`Connected ${label}!`)
            return
        }
        toast.error(oauthConnectErrorMessage(result.reason, label))
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
                    const isConnecting = pending === id
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
                                        disabled={!canDisconnect}
                                        onClick={() =>
                                            setTarget({ providerId: id, label })
                                        }
                                    >
                                        Disconnect
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isConnecting}
                                        onClick={() => handleConnect(id, label)}
                                    >
                                        <Icon
                                            size={16}
                                            color={color}
                                            className="mr-1"
                                        />
                                        {isConnecting ? "Connecting..." : "Connect"}
                                    </Button>
                                )}
                            </div>
                            {acct && !canDisconnect && (
                                <p className="px-1 text-xs text-muted-foreground">
                                    Add another sign-in method first!
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
            <DisconnectProviderDialog
                target={target}
                onClose={() => setTarget(null)}
            />
        </SectionPanel>
    )
}
