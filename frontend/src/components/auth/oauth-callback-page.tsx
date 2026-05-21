import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { checkSession } from "@/hooks/auth/auth-api"
import { fetchAuthMethodsFn } from "@/hooks/auth/auth-methods-api"
import { consumeConnectStash } from "@/lib/oauth-flow"
import { consumeRememberMeStash } from "@/lib/remember-me"
import { CompleteSignupCard } from "@/components/auth/complete-signup-card"
import type { AuthMethodsSocialAccount, AuthProvider } from "@/types/auth"

function socialKey(s: AuthMethodsSocialAccount): string {
    return `${s.provider}:${s.uid}`
}

const PROVIDER_LABEL: Record<AuthProvider, string> = {
    discord: "Discord",
    twitch: "Twitch",
}

export function OAuthCallbackPage() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const qc = useQueryClient()
    const proc = params.get("proc") ?? params.get("error_process") ?? "login"
    const errorParam = params.get("error")
    const isSignup = proc === "signup" && !errorParam

    useEffect(() => {
        if (isSignup) return
        let cancelled = false
        const run = async () => {
            consumeRememberMeStash()

            if (errorParam === "cancelled") {
                navigate("/login/cancelled", { replace: true })
                return
            }
            if (errorParam === "signup_closed") {
                navigate("/login/no-link", { replace: true })
                return
            }
            if (errorParam) {
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
                qc.invalidateQueries({ queryKey: queryKeys.auth.methods() })
                navigate("/profile/settings/security", { replace: true })
                return
            }

            const beforeKeys = new Set(stash.map(socialKey))
            try {
                const after = await qc.fetchQuery({
                    queryKey: queryKeys.auth.methods(),
                    queryFn: ({ signal }) => fetchAuthMethodsFn(signal),
                    staleTime: 0,
                })
                if (cancelled) return
                const added = after.social_accounts.find(
                    (s) => !beforeKeys.has(socialKey(s)),
                )
                if (added) {
                    toast.success(`Connected ${PROVIDER_LABEL[added.provider]}.`)
                }
            } catch {
                // OAuth already succeeded; the refresh-and-toast is best-effort.
            }
            navigate("/profile/settings/security", { replace: true })
        }

        run()

        return () => { cancelled = true }
    }, [errorParam, isSignup, params, navigate, qc, proc])

    if (isSignup) {
        return (
            <div className="mx-auto max-w-md py-12">
                <CompleteSignupCard />
            </div>
        )
    }

    return (
        <div className="text-center text-sm text-muted-foreground">
            Signing In...
        </div>
    )
}
