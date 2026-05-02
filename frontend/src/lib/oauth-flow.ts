// The OAuth round-trip wipes the in-memory QueryClient (full page navigation
// to the provider and back). To verify on return that linking actually
// happened, we stash the pre-flow provider list in sessionStorage before
// the redirect and compare against the post-flow list on the callback.
// The presence of the stash also doubles as proof the user reached the
// callback through our button rather than via a spoofed URL.
import type { QueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import type { LinkedProvider } from "@/types/auth"

const OAUTH_CONNECT_STASH_KEY = "oauth.connect.preProviders"

export function stashConnectPreState(qc: QueryClient): void {
    const linked = qc.getQueryData<LinkedProvider[]>(
        queryKeys.auth.linkedProviders(),
    )
    sessionStorage.setItem(
        OAUTH_CONNECT_STASH_KEY,
        JSON.stringify(linked ?? []),
    )
}

export function consumeConnectStash(): LinkedProvider[] | null {
    const raw = sessionStorage.getItem(OAUTH_CONNECT_STASH_KEY)
    if (raw === null) return null
    sessionStorage.removeItem(OAUTH_CONNECT_STASH_KEY)
    try {
        return JSON.parse(raw) as LinkedProvider[]
    } catch {
        return null
    }
}
