import { useState } from "react"
import { SiDiscord, SiTwitch } from "@icons-pack/react-simple-icons"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useLinkedProviders } from "@/hooks/auth/useLinkedProviders"
import { useDisconnectProvider } from "@/hooks/auth/useDisconnectProvider"
import { OAuthProviderButton } from "@/components/auth/oauth-provider-button"
import { Button } from "@/components/ui/button"
import { SectionPanel } from "@/components/profile/section-panel"
import { cn } from "@/lib/utils"
import { DisconnectProviderDialog } from "./disconnect-provider-dialog"

const PROVIDERS = [
    { id: "discord", label: "Discord", Icon: SiDiscord, color: "#5865F2" },
    { id: "twitch", label: "Twitch", Icon: SiTwitch, color: "#9146FF" },
] as const

type ProviderId = (typeof PROVIDERS)[number]["id"]

interface DisconnectTarget {
    providerId: ProviderId
    label: string
    account: string
}

const ROW_CLASS = cn(
    "flex items-center",
    "justify-between",
    "rounded-md",
    "border border-border/40",
    "px-4 py-3",
)

// Allauth's headless API returns the provider's display name (e.g., Discord's
// `global_name`) in `display`. The user's Player profile stores the actual
// handle/URL via the `social_account_added` signal, so we prefer those for the
// row label and only fall back to allauth's display when we don't have one yet.
function rowLabel(
    providerId: ProviderId,
    socialsValue: string | null,
    fallback: string,
): string {
    if (socialsValue) {
        if (providerId === "twitch") {
            // Strip the URL down to "@login" so the row stays compact.
            const match = socialsValue.match(/twitch\.tv\/([^/?#]+)/i)
            return match ? match[1] : socialsValue
        }
        return socialsValue
    }
    return fallback
}

export function ConnectedAccountsSection() {
    const { player } = useCurrentPlayer()
    const { data: linked = [] } = useLinkedProviders()
    const disconnect = useDisconnectProvider()
    const socials = player?.socials
    const [target, setTarget] = useState<DisconnectTarget | null>(null)

    const handleConfirm = (password: string) => {
        if (!target) return
        disconnect.mutate(
            {
                provider: target.providerId,
                account: target.account,
                password,
            },
            {
                onSuccess: () => setTarget(null),
            },
        )
    }

    return (
        <SectionPanel
            title="Connected Accounts"
            description="Link Discord or Twitch so you can sign in with one click."
        >
            <div className="flex flex-col gap-3">
                {PROVIDERS.map(({ id, label, Icon, color }) => {
                    const acct = linked.find((l) => l.provider.id === id)
                    return (
                        <div key={id} className={ROW_CLASS}>
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Icon size={18} color={color} />
                                {label}
                                {acct && (
                                    <span className="text-muted-foreground font-normal">
                                        connected as{" "}
                                        {rowLabel(
                                            id,
                                            socials?.[id] ?? null,
                                            acct.display,
                                        )}
                                    </span>
                                )}
                            </span>
                            {acct ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={disconnect.isPending}
                                    onClick={() =>
                                        setTarget({
                                            providerId: id,
                                            label,
                                            account: acct.uid,
                                        })
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
