import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router"
import {
    ApiError,
    setAuthLostHandler,
    setBannedHandler,
    setMfaSetupHandler,
} from "@/lib/api-client"
import { setMfaGate } from "@/lib/mfa-gate"
import { queryKeys } from "@/lib/query-keys"
import { router } from "./router.tsx"
import "./index.css"

// Defaults for how the application should handle web requests.
// 4xx errors will not retry, since there is an issue that may not be resolvable.
// Otherwise, for other errors (e.g. 500) there will be some re-attempts before erroring out.
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                if (error instanceof ApiError && error.isClientError) {
                    return false
                }
                return failureCount < 5
            },
        },
        mutations: {
            retry: false,
        },
    },
})

setAuthLostHandler(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
    queryClient.removeQueries({ queryKey: queryKeys.auth.me() })
})

let bannedHandled = false
setBannedHandler(() => {
    if (bannedHandled) return
    bannedHandled = true
    window.location.assign("/login/banned")
})

setMfaSetupHandler(() => {
    setMfaGate(true)
})

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
)
