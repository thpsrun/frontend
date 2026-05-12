import { StrictMode, type ComponentType } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiError, setAuthLostHandler } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { Provider as JotaiProvider } from "jotai"
import "./index.css"
import App from "./App.tsx"
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router";
import { NotFoundPage } from "./components/layout/not-found-page.tsx"
import { MainPage } from "./components/home/main-page.tsx"
import { GameOverview } from "./components/game/game-overview.tsx"
import { LoginPage } from "./components/auth/login-page.tsx"
import { RegisterPage } from "./components/auth/register-page.tsx"
import { OAuthCancelledPage } from "./components/auth/oauth-cancelled-page.tsx"
import { OAuthErrorPage } from "./components/auth/oauth-error-page.tsx"
import { NoLinkPage } from "@/components/auth/no-link-page"
import { BannedPage } from "@/components/auth/banned-page"
import { OAuthCallbackPage } from "@/components/auth/oauth-callback-page"
import { ProfileSettingsLayout } from "./components/profile/profile-settings-layout.tsx"
import { PlayerProfile } from "./components/player/player-profile.tsx"
import { ProtectedRoute } from "./components/auth/protected-route.tsx"
import { SubmissionsHub } from "./components/submissions/submissions-hub.tsx"
import { AdminHub } from "./components/admin/admin-hub.tsx"
import { PrivacyPage } from "./components/legal/privacy-page.tsx"
import { FAQPage } from "./components/legal/faq-page.tsx"
import { ChangelogRedirect } from "./components/legal/changelog-redirect.tsx"
import { SocialRedirect } from "./components/layout/social-redirect.tsx"
import { GeneralSection } from "./components/profile/sections/general-section.tsx"
import { SocialSection } from "./components/profile/sections/social-section.tsx"
import { CustomizationSection } from "./components/profile/sections/customization-section.tsx"
import { SecuritySection } from "./components/profile/sections/security-section.tsx"
import { ApiKeysSection } from "./components/profile/sections/api-keys-section.tsx"
import { DangerSection } from "./components/profile/sections/danger-section.tsx"
import { HistoricalRankingsPage } from "./components/rankings/historical-rankings-page.tsx"
import { RankingsRedirect } from "./components/rankings/rankings-redirect.tsx"
import { ProfileContentLayout } from "./components/profile/profile-content-layout.tsx"
import { AdminLayout } from "./components/admin/admin-layout.tsx"
import { SuperuserRoute } from "./components/routing/SuperuserRoute.tsx"

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
                if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
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

// Lazy-loading on several components, since they are the heavier parts of the code.
// If you are wanting to know: if given a function that loads modules, return the router
// and pulls the components out. This should make the site load a lot faster for a lot of people!
const lazyComponent = <T, K extends keyof T>(load: () => Promise<T>, key: K) =>
    async () => ({ Component: (await load())[key] as ComponentType })

const lazyGuideForm = (mode: "create" | "edit") => async () => {
    const m = await import("./components/guides/guide-form-page.tsx")
    return { element: <m.GuideFormPage mode={mode} /> }
}

const lazyGuidesHub = lazyComponent(
    () => import("./components/guides/guides-hub-page.tsx"),
    "GuidesHubPage",
)
const lazyGuideDetail = lazyComponent(
    () => import("./components/guides/guide-detail-page.tsx"),
    "GuideDetailPage",
)
const lazyGuidesSection = lazyComponent(
    () => import("./components/profile/sections/guides-section.tsx"),
    "GuidesSection",
)
const lazyRunsSection = lazyComponent(
    () => import("./components/profile/sections/runs-section.tsx"),
    "RunsSection",
)
const lazyTagsAdmin = lazyComponent(
    () => import("./components/admin/tags/tags-admin-page.tsx"),
    "TagsAdminPage",
)
const lazyBotSession = lazyComponent(
    () => import("./components/admin/bot-session/bot-session-page.tsx"),
    "BotSessionPage",
)
const lazyReconcile = lazyComponent(
    () => import("./components/admin/reconcile/reconcile-page.tsx"),
    "ReconcilePage",
)
const lazyReconcileDetail = lazyComponent(
    () => import("./components/admin/reconcile/reconcile-detail-page.tsx"),
    "ReconcileDetailPage",
)
const lazyGameDisplay = lazyComponent(
    () => import("./components/admin/game-display/game-display-page.tsx"),
    "GameDisplayPage",
)
const lazyGameDisplayDetail = lazyComponent(
    () => import("./components/admin/game-display/game-display-detail-page.tsx"),
    "GameDisplayDetailPage",
)
const lazyUsersAdmin = lazyComponent(
    () => import("./components/admin/users/users-admin-page.tsx"),
    "UsersAdminPage",
)
const lazyUsersAdminDetail = lazyComponent(
    () => import("./components/admin/users/users-admin-detail.tsx"),
    "UsersAdminDetailPage",
)

const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            { index: true, Component: MainPage },
            { path: "rankings", Component: RankingsRedirect },
            { path: "rankings/:gameSlug", Component: RankingsRedirect },
            {
                path: "rankings/history/:mode/:year/:month/:gameSlug?",
                Component: HistoricalRankingsPage,
            },
            { path: "guides", lazy: lazyGuidesHub },
            { path: "guides/:gameSlug/:guideSlug", lazy: lazyGuideDetail },
            { path: ":gameSlug/*", Component: GameOverview },
            { path: "login", Component: LoginPage },
            { path: "register", Component: RegisterPage },
            { path: "login/cancelled", Component: OAuthCancelledPage },
            { path: "login/error", Component: OAuthErrorPage },
            { path: "login/no-link", Component: NoLinkPage },
            { path: "login/banned", Component: BannedPage },
            { path: "oauth/callback", Component: OAuthCallbackPage },
            {
                Component: ProtectedRoute,
                children: [
                    {
                        path: "profile/settings",
                        Component: ProfileSettingsLayout,
                        children: [
                            { index: true, element: null },
                            { path: "general", Component: GeneralSection },
                            { path: "customization", Component: CustomizationSection },
                            { path: "social", Component: SocialSection },
                            { path: "security", Component: SecuritySection },
                            { path: "api-keys", Component: ApiKeysSection },
                            { path: "danger", Component: DangerSection },
                        ],
                    },
                    {
                        path: "profile/content",
                        Component: ProfileContentLayout,
                        children: [
                            { index: true, element: null },
                            { path: "guides", lazy: lazyGuidesSection },
                            { path: "runs", lazy: lazyRunsSection },
                        ],
                    },
                    { path: "submissions", Component: SubmissionsHub },
                    { path: "guides/new", lazy: lazyGuideForm("create") },
                    {
                        path: "guides/:gameSlug/:guideSlug/edit",
                        lazy: lazyGuideForm("edit"),
                    },
                ],
            },
            {
                Component: SuperuserRoute,
                children: [
                    {
                        path: "admin",
                        Component: AdminLayout,
                        children: [
                            { index: true, element: null },
                            { path: "sync-logs", Component: AdminHub },
                            { path: "bot-session", lazy: lazyBotSession },
                            { path: "reconcile", lazy: lazyReconcile },
                            { path: "reconcile/:jobId", lazy: lazyReconcileDetail },
                            { path: "tags", lazy: lazyTagsAdmin },
                            { path: "game-display", lazy: lazyGameDisplay },
                            { path: "game-display/:gameId", lazy: lazyGameDisplayDetail },
                            { path: "users", lazy: lazyUsersAdmin },
                            { path: "users/:ident", lazy: lazyUsersAdminDetail },
                        ],
                    },
                ],
            },
            { path: "player/:playerName", Component: PlayerProfile },
            { path: "privacy", Component: PrivacyPage },
            { path: "faq", Component: FAQPage },
            { path: "changelog", Component: ChangelogRedirect },
            { path: "src", element: <SocialRedirect platform="Speedrun" /> },
            { path: "discord", element: <SocialRedirect platform="Discord" /> },
            { path: "bluesky", element: <SocialRedirect platform="Bluesky" /> },
            { path: "youtube", element: <SocialRedirect platform="YouTube" /> },
            { path: "twitch", element: <SocialRedirect platform="Twitch" /> },
            { path: "*", Component: NotFoundPage },
        ]
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <JotaiProvider>
                <RouterProvider router={router} />
            </JotaiProvider>
        </QueryClientProvider>
    </StrictMode>,
)
