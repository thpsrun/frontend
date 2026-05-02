import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { listLinkedProviders } from "@/hooks/auth/social-api"
import { consumeConnectStash } from "@/lib/oauth-flow"
import type { LinkedProvider } from "@/types/auth"

function providerKey(p: LinkedProvider): string {
    return `${p.provider.id}:${p.uid}`
}

export function OAuthCallbackPage() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const qc = useQueryClient()

    useEffect(() => {
        const error = params.get("error")
        // `proc` source priority: explicit ?proc=... (set by OAuthProviderButton on
        // both success and error paths) → ?error_process=... (allauth's error path
        // fallback) → default "login".
        const proc = params.get("proc") ?? params.get("error_process") ?? "login"

        if (error === "cancelled") {
            navigate("/login/cancelled", { replace: true })
            return
        }
        if (error === "signup_closed") {
            // Defensive fallback. The backend's pre_social_login should have already
            // redirected to /login/no-link before reaching this page; this branch
            // only fires if that hook is somehow bypassed.
            navigate("/login/no-link", { replace: true })
            return
        }
        if (error) {
            navigate("/login/error", { replace: true })
            return
        }

        // Success path. Refresh session-derived queries.
        qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
        qc.invalidateQueries({ queryKey: queryKeys.auth.me() })

        if (proc !== "connect") {
            navigate("/", { replace: true })
            return
        }

        // Verify the link actually happened: compare pre-flow providers
        // (stashed by OAuthProviderButton before form submit) against the
        // current list. A missing stash means this page was reached without
        // going through our button (e.g., a spoofed ?proc=connect URL), so
        // skip the success toast.
        const stash = consumeConnectStash()
        if (stash === null) {
            navigate("/profile/settings/security", { replace: true })
            return
        }

        const beforeKeys = new Set(stash.map(providerKey))
        qc.fetchQuery({
            queryKey: queryKeys.auth.linkedProviders(),
            queryFn: ({ signal }) => listLinkedProviders(signal),
            staleTime: 0,
        })
            .then((after) => {
                const added = after.find((p) => !beforeKeys.has(providerKey(p)))
                if (added) {
                    toast.success(`Connected ${added.provider.name}.`)
                }
            })
            .catch(() => {
                // Refetch failed (e.g., network blip). Stay quiet rather
                // than claim a connection we can't verify.
            })
            .finally(() => {
                navigate("/profile/settings/security", { replace: true })
            })
    }, [params, navigate, qc])

    return (
        <div className="pt-20 text-center text-sm text-muted-foreground">
            Signing you in...
        </div>
    )
}
