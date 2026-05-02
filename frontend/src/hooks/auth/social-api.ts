import { apiFetch } from "@/lib/api-client"
import type { LinkedProvider } from "@/types/auth"

interface ListResponse {
    data: LinkedProvider[]
}

export async function listLinkedProviders(
    signal?: AbortSignal,
): Promise<LinkedProvider[]> {
    const res = await apiFetch<ListResponse>("/account/providers", {
        base: "allauth",
        signal,
    })
    return res.data
}

export async function disconnectProvider(
    provider: string,
    account: string,
): Promise<void> {
    await apiFetch("/account/providers", {
        base: "allauth",
        method: "DELETE",
        json: { provider, account },
    })
}
