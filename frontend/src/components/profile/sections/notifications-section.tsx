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

export function NotificationsSection() {
    const prefsQuery = useNotificationPreferences()
    const update = useUpdatePreferences()

    const handleToggle = (kind: string, next: boolean) => {
        update.mutate(
            { [kind]: next },
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
            Choose what types of notifications you'd like to receive. Changes are saved automatically.
        </p>
    )

    return (
        <div className="flex flex-col gap-6">
            <SectionPanel title="Notifications" description={description}>
                {prefsQuery.isLoading && (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="size-5 w-9 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
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

                {prefsQuery.data && prefsQuery.data.preferences.length > 0 && (
                    <ul className="flex flex-col gap-4">
                        {prefsQuery.data.preferences.map((p) => (
                            <li
                                key={p.kind}
                                className="flex items-start gap-3"
                            >
                                <Switch
                                    id={`pref-${p.kind}`}
                                    checked={p.enabled}
                                    disabled={update.isPending}
                                    onCheckedChange={(checked) =>
                                        handleToggle(p.kind, checked)
                                    }
                                />
                                <label
                                    htmlFor={`pref-${p.kind}`}
                                    className="flex flex-col gap-0.5"
                                >
                                    <span className="text-sm font-medium">
                                        {p.label}
                                    </span>
                                    {p.description && (
                                        <span className="text-xs text-muted-foreground">
                                            {p.description}
                                        </span>
                                    )}
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionPanel>
        </div>
    )
}
