import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useSession } from "@/hooks/auth/useSession"
import {
    getPreferencesFn,
    updatePreferencesFn,
    listKindsFn,
} from "./notifications-api"
import type {
    NotificationPreference,
    NotificationPreferenceUpdate,
    NotificationPreferencesResponse,
} from "@/types/notifications"

export function useNotificationPreferences() {
    const { isAuthenticated } = useSession()
    return useQuery({
        queryKey: queryKeys.notifications.preferences(),
        queryFn: ({ signal }) => getPreferencesFn(signal),
        enabled: isAuthenticated,
        staleTime: 60_000,
    })
}

export function useNotificationKinds() {
    const { isAuthenticated } = useSession()
    return useQuery({
        queryKey: queryKeys.notifications.kinds(),
        queryFn: ({ signal }) => listKindsFn(signal),
        enabled: isAuthenticated,
        staleTime: 5 * 60_000,
    })
}

export function useUpdatePreferences() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (prefs: NotificationPreferenceUpdate) =>
            updatePreferencesFn(prefs),
        onMutate: async (prefs) => {
            await qc.cancelQueries({ queryKey: queryKeys.notifications.preferences() })
            const prev = qc.getQueryData<NotificationPreferencesResponse>(
                queryKeys.notifications.preferences(),
            )
            if (prev) {
                const next: NotificationPreferencesResponse = {
                    preferences: prev.preferences.map((p): NotificationPreference => {
                        const patch = prefs[p.kind]
                        if (!patch) return p
                        const mergedChannels = { ...p.channels }
                        for (const [channel, value] of Object.entries(patch)) {
                            if (typeof value === "boolean") {
                                mergedChannels[channel] = value
                            }
                        }
                        return { ...p, channels: mergedChannels }
                    }),
                }
                qc.setQueryData(queryKeys.notifications.preferences(), next)
            }
            return { prev }
        },
        onError: (_err, _vars, ctx) => {
            const snapshot = (ctx as { prev?: NotificationPreferencesResponse } | undefined)?.prev
            if (snapshot) {
                qc.setQueryData(queryKeys.notifications.preferences(), snapshot)
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: queryKeys.notifications.preferences() })
        },
    })
}
