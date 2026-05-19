import { apiFetch } from "@/lib/api-client"
import type { GamePlatform } from "@/types/api"

export const listPlatformsFn = (
    signal?: AbortSignal,
): Promise<GamePlatform[]> =>
    apiFetch<GamePlatform[]>("/platforms", { signal })
