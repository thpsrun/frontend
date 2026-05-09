import { apiFetch } from "@/lib/api-client"
import type {
    BotSessionResponse,
    KillSwitchRequest,
    KillSwitchResponse,
} from "@/types/bot-session"

export const fetchBotSession = (
    signal?: AbortSignal,
): Promise<BotSessionResponse> =>
    apiFetch<BotSessionResponse>(
        "/auth/admin/bot-session",
        { signal },
    )

export const refreshBotSessionFn = (): Promise<BotSessionResponse> =>
    apiFetch<BotSessionResponse>(
        "/auth/admin/bot-session/refresh",
        { method: "POST" },
    )

export const setKillSwitchFn = (
    body: KillSwitchRequest,
): Promise<KillSwitchResponse> =>
    apiFetch<KillSwitchResponse>(
        "/auth/admin/bot-session/kill-switch",
        { method: "PUT", json: body },
    )
