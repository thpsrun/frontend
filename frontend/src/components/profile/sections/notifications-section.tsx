import { toast } from "sonner"

import { SectionPanel } from "@/components/profile/section-panel"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertBanner } from "@/components/common/alert-banner"
import { getErrorMessage } from "@/lib/utils"
import {
    useNotificationPreferences,
    useUpdatePreferences,
} from "@/hooks/notifications/useNotificationPrefs"

const CHANNEL_LABELS: Record<string, string> = {
    in_app: "Website",
    email: "Email",
}

function channelLabel(channel: string): string {
    if (CHANNEL_LABELS[channel]) return CHANNEL_LABELS[channel]
    return channel.charAt(0).toUpperCase() + channel.slice(1).replace(/_/g, " ")
}

export function NotificationsSection() {
    const prefsQuery = useNotificationPreferences()
    const update = useUpdatePreferences()

    // Sends a single-kind, single-channel patch; useUpdatePreferences applies it optimistically
    // and rolls back on error, so no pending state is tracked here.
    const handleToggle = (kind: string, channel: string, next: boolean) => {
        update.mutate(
            { [kind]: { [channel]: next } },
            {
                onError: (err) => {
                    toast.error(
                        getErrorMessage(
                            err,
                            "Couldn't save preference. Try again...",
                        ),
                    )
                },
            },
        )
    }

    const description = (
        <p className="max-w-xl">
            Choose what types of notifications you'd like to receive and how they reach you.
            Email notifications are sent to your primary address. Changes are saved
            automatically.
        </p>
    )

    return (
        <div className="flex flex-col gap-6">
            <SectionPanel title="Notifications" description={description}>
                {prefsQuery.isLoading && (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                                <Skeleton className="size-5 w-9 rounded-full" />
                                <Skeleton className="size-5 w-9 rounded-full" />
                            </div>
                        ))}
                    </div>
                )}

                {prefsQuery.isError && (
                    <AlertBanner variant="error">
                        Failed to load notification preferences. Refresh the page to try again.
                    </AlertBanner>
                )}

                {prefsQuery.data && prefsQuery.data.preferences.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No notification kinds are currently available.
                    </p>
                )}

                {prefsQuery.data && prefsQuery.data.preferences.length > 0 && (() => {
                    // The column set is the union of channels across all kinds; the backend may
                    // not expose every channel on every kind.
                    const channelKeys = Array.from(
                        new Set(
                            prefsQuery.data.preferences.flatMap((p) => Object.keys(p.channels)),
                        ),
                    )
                    return (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-border/60">
                                    <th scope="col" className="w-full" />
                                    {channelKeys.map((channel) => (
                                        <th
                                            key={channel}
                                            scope="col"
                                            className="w-20 px-2 pb-2 text-center text-[11px] font-medium text-muted-foreground"
                                        >
                                            {channelLabel(channel)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {prefsQuery.data.preferences.map((p) => (
                                    <tr
                                        key={p.kind}
                                        className="border-b border-border/40 last:border-b-0"
                                    >
                                        <th
                                            scope="row"
                                            className="py-4 pr-4 text-left align-middle font-normal"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium">
                                                    {p.label}
                                                </span>
                                                {p.description && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {p.description}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        {channelKeys.map((channel) => {
                                            const value = p.channels[channel] ?? false
                                            const switchId = `pref-${p.kind}-${channel}`
                                            return (
                                                <td
                                                    key={channel}
                                                    className="w-20 px-2 py-4 text-center align-middle"
                                                >
                                                    <Switch
                                                        id={switchId}
                                                        checked={value}
                                                        aria-label={`${channelLabel(channel)} notifications for ${p.label}`}
                                                        onCheckedChange={(checked) =>
                                                            handleToggle(p.kind, channel, checked)
                                                        }
                                                    />
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                })()}
            </SectionPanel>
        </div>
    )
}
