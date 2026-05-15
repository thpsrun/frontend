import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { listLinkedProviders } from "@/hooks/auth/social-api"
import { checkSession } from "@/hooks/auth/auth-api"
import { consumeConnectStash } from "@/lib/oauth-flow"
import { consumeRememberMeStash } from "@/lib/remember-me"
import type { LinkedProvider } from "@/types/auth"

function providerKey(p: LinkedProvider): string {
    return `${p.provider.id}:${p.uid}`
}

export function OAuthCallbackPage() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const qc = useQueryClient()

    useEffect(() => {
        let cancelled = false
        const run = async () => {
            consumeRememberMeStash()

            const error = params.get("error")
            const proc = params.get("proc") ?? params.get("error_process") ?? "login"

            if (error === "cancelled") {
                navigate("/login/cancelled", { replace: true })
                return
            }
            if (error === "signup_closed") {
                navigate("/login/no-link", { replace: true })
                return
            }
            if (error) {
                navigate("/login/error", { replace: true })
                return
            }

            qc.invalidateQueries({ queryKey: queryKeys.auth.session() })
            qc.invalidateQueries({ queryKey: queryKeys.auth.me() })

            const session = await qc.fetchQuery({
                queryKey: queryKeys.auth.session(),
                queryFn: ({ signal }) => checkSession(signal),
                staleTime: 0,
            })

            if (cancelled) return

            if (!session.isAuthenticated) {
                navigate("/login/error", { replace: true })
                return
            }

            if (proc !== "connect") {
                navigate("/", { replace: true })
                return
            }

            const stash = consumeConnectStash()
            if (stash === null) {
                navigate("/profile/settings/security", { replace: true })
                return
            }

            const beforeKeys = new Set(stash.map(providerKey))
            try {
                const after = await qc.fetchQuery({
                    queryKey: queryKeys.auth.linkedProviders(),
                    queryFn: ({ signal }) => listLinkedProviders(signal),
                    staleTime: 0,
                })
                if (cancelled) return
                const added = after.find((p) => !beforeKeys.has(providerKey(p)))
                if (added) {
                    toast.success(`Connected ${added.provider.name}.`)
                }
            } catch {
            }
            navigate("/profile/settings/security", { replace: true })
        }

        run()

        return () => { cancelled = true }
    }, [params, navigate, qc])

    return (
        <div className="text-center text-sm text-muted-foreground">
            Signing In...
        </div>
    )
}
