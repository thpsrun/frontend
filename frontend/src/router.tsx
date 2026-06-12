import { lazy } from "react"
import type { ComponentType, LazyExoticComponent } from "react"
import { createBrowserRouter, Navigate } from "react-router"

import App from "./App.tsx"

// Layout / routing helpers
import { NotFoundPage } from "./components/layout/not-found-page.tsx"
import { SocialRedirect } from "./components/layout/social-redirect.tsx"
import { ProtectedRoute } from "./components/auth/protected-route.tsx"
import { SuperuserRoute } from "./components/routing/SuperuserRoute.tsx"

// Home / game / player
import { MainPage } from "./components/home/main-page.tsx"
import { GameOverview } from "./components/game/game-overview.tsx"
import { PlayerProfile } from "./components/player/player-profile.tsx"

// Auth pages
import { LoginPage } from "./components/auth/login-page.tsx"
import { RegisterPage } from "./components/auth/register-page.tsx"
import { BannedPage } from "./components/auth/banned-page.tsx"
import { ForgotPasswordPage } from "./components/auth/forgot-password-page.tsx"
import { ResetPasswordPage } from "./components/auth/reset-password-page.tsx"
import { VerifyEmailPage } from "./components/auth/verify-email-page.tsx"

// Rankings
import { RankingsRedirect } from "./components/rankings/rankings-redirect.tsx"
import { HistoricalRankingsPage } from "./components/rankings/historical-rankings-page.tsx"

// Guides hub is a plain listing that game-overview also renders inline, so it
// stays in the main bundle (lazy-loading it here would be ineffective).
import { GuidesHubPage } from "./components/guides/guides-hub-page.tsx"

// Guide detail/form are lazy - they pull in the markdown renderer + editor
// (react-markdown + remark/rehype) and are only reached via their own routes.
const GuideDetailPage = lazy(() =>
    import("./components/guides/guide-detail-page.tsx").then((m) => ({ default: m.GuideDetailPage })),
)
const GuideFormPage = lazy(() =>
    import("./components/guides/guide-form-page.tsx").then((m) => ({ default: m.GuideFormPage })),
)

// Profile settings/content + sections
import { ProfileSettingsLayout } from "./components/profile/profile-settings-layout.tsx"
import { ProfileContentLayout } from "./components/profile/profile-content-layout.tsx"
import { GeneralSection } from "./components/profile/sections/general-section.tsx"
import { CustomizationSection } from "./components/profile/sections/customization-section.tsx"
import { SocialSection } from "./components/profile/sections/social-section.tsx"
import { SecuritySection } from "./components/profile/sections/security-section.tsx"
import { SrcApiSection } from "./components/profile/sections/src-api-section.tsx"
import { ApiKeysSection } from "./components/profile/sections/api-keys-section.tsx"
import { NotificationsSection } from "./components/profile/sections/notifications-section.tsx"
import { DangerSection } from "./components/profile/sections/danger-section.tsx"
import { GuidesSection } from "./components/profile/sections/guides-section.tsx"
import { RunsSection } from "./components/profile/sections/runs-section.tsx"

// Submissions / notifications
import { SubmissionsHub } from "./components/submissions/submissions-hub.tsx"
import { NotificationsPage } from "./components/notifications/notifications-page.tsx"

// Admin and game-management are tabbed areas behind a shared layout. Each loads
// as a single chunk via its barrel module (see admin-routes / manage-routes):
// the names below are key-checked against the barrel's exports at compile time.
function lazyArea<M extends Record<string, unknown>>(loader: () => Promise<M>) {
    return <K extends keyof M>(name: K): LazyExoticComponent<ComponentType> =>
        lazy(() => loader().then((m) => ({ default: m[name] as ComponentType })))
}
const lazyManage = lazyArea(() => import("./components/manage/manage-routes.ts"))
const lazyAdmin = lazyArea(() => import("./components/admin/admin-routes.ts"))

// Game management (moderator)
const GameManageLayout = lazyManage("GameManageLayout")
const ManageGeneralSection = lazyManage("ManageGeneralSection")
const TimingSection = lazyManage("TimingSection")
const CategoriesSection = lazyManage("CategoriesSection")
const VariablesSection = lazyManage("VariablesSection")
const DisplayOrderSection = lazyManage("DisplayOrderSection")
const AuditSection = lazyManage("AuditSection")
const ModeratorsSection = lazyManage("ModeratorsSection")

// Admin - superuser-only
const AdminLayout = lazyAdmin("AdminLayout")
const AdminHub = lazyAdmin("AdminHub")
const TagsAdminPage = lazyAdmin("TagsAdminPage")
const NavbarAdminPage = lazyAdmin("NavbarAdminPage")
const BotSessionPage = lazyAdmin("BotSessionPage")
const ReconcilePage = lazyAdmin("ReconcilePage")
const ReconcileDetailPage = lazyAdmin("ReconcileDetailPage")
const GameDisplayPage = lazyAdmin("GameDisplayPage")
const GameDisplayDetailPage = lazyAdmin("GameDisplayDetailPage")
const UsersAdminPage = lazyAdmin("UsersAdminPage")
const UsersAdminDetailPage = lazyAdmin("UsersAdminDetailPage")

// Legal / misc
import { PrivacyPage } from "./components/legal/privacy-page.tsx"
import { FAQPage } from "./components/legal/faq-page.tsx"

export const router = createBrowserRouter([
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
            { path: "guides", Component: GuidesHubPage },
            { path: "guides/:gameSlug/:guideSlug", Component: GuideDetailPage },
            { path: ":gameSlug/*", Component: GameOverview },
            { path: "login", Component: LoginPage },
            { path: "register", Component: RegisterPage },
            { path: "login/banned", Component: BannedPage },
            { path: "forgot-password", Component: ForgotPasswordPage },
            {
                path: "reset-password/:uidb36/:key",
                Component: ResetPasswordPage,
            },
            { path: "verify-email", Component: VerifyEmailPage },
            { path: "verify-email/:key", Component: VerifyEmailPage },
            {
                Component: ProtectedRoute,
                children: [
                    {
                        path: "profile/settings",
                        Component: ProfileSettingsLayout,
                        children: [
                            { index: true, element: null },
                            {
                                path: "general",
                                element: (
                                    <div className="flex flex-col gap-6">
                                        <GeneralSection />
                                        <CustomizationSection />
                                    </div>
                                ),
                            },
                            { path: "social", Component: SocialSection },
                            { path: "security", Component: SecuritySection },
                            { path: "src-api", Component: SrcApiSection },
                            { path: "api-keys", Component: ApiKeysSection },
                            { path: "notifications", Component: NotificationsSection },
                            { path: "danger", Component: DangerSection },
                        ],
                    },
                    {
                        path: "profile/content",
                        Component: ProfileContentLayout,
                        children: [
                            { index: true, element: null },
                            { path: "guides", Component: GuidesSection },
                            { path: "runs", Component: RunsSection },
                        ],
                    },
                    { path: "submissions", Component: SubmissionsHub },
                    { path: "notifications", Component: NotificationsPage },
                    { path: "guides/new", element: <GuideFormPage mode="create" /> },
                    {
                        path: "guides/:gameSlug/:guideSlug/edit",
                        element: <GuideFormPage mode="edit" />,
                    },
                    {
                        path: ":gameSlug/manage",
                        Component: GameManageLayout,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="timing" replace />,
                            },
                            { path: "general", Component: ManageGeneralSection },
                            { path: "timing", Component: TimingSection },
                            { path: "categories", Component: CategoriesSection },
                            { path: "variables", Component: VariablesSection },
                            { path: "audit", Component: AuditSection },
                            { path: "moderators", Component: ModeratorsSection },
                            { path: "display-order", Component: DisplayOrderSection },
                        ],
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
                            { path: "thpsbot", Component: BotSessionPage },
                            { path: "reconcile", Component: ReconcilePage },
                            { path: "reconcile/:jobId", Component: ReconcileDetailPage },
                            { path: "tags", Component: TagsAdminPage },
                            { path: "navbar", Component: NavbarAdminPage },
                            { path: "game-display", Component: GameDisplayPage },
                            { path: "game-display/:gameId", Component: GameDisplayDetailPage },
                            { path: "users", Component: UsersAdminPage },
                            { path: "users/:ident", Component: UsersAdminDetailPage },
                        ],
                    },
                ],
            },
            { path: "player/:playerName", Component: PlayerProfile },
            { path: "privacy", Component: PrivacyPage },
            { path: "faq", Component: FAQPage },
            { path: "src", element: <SocialRedirect platform="Speedrun" /> },
            { path: "discord", element: <SocialRedirect platform="Discord" /> },
            { path: "bluesky", element: <SocialRedirect platform="Bluesky" /> },
            { path: "youtube", element: <SocialRedirect platform="YouTube" /> },
            { path: "twitch", element: <SocialRedirect platform="Twitch" /> },
            { path: "*", Component: NotFoundPage },
        ],
    },
])
