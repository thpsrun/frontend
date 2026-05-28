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

// Guides
import { GuidesHubPage } from "./components/guides/guides-hub-page.tsx"
import { GuideDetailPage } from "./components/guides/guide-detail-page.tsx"
import { GuideFormPage } from "./components/guides/guide-form-page.tsx"

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

// Game management (moderator)
import { GameManageLayout } from "./components/manage/game-manage-layout.tsx"
import { GeneralSection as ManageGeneralSection } from "./components/manage/sections/general-section.tsx"
import { TimingSection } from "./components/manage/sections/timing-section.tsx"
import { CategoriesSection } from "./components/manage/sections/categories-section.tsx"
import { VariablesSection } from "./components/manage/sections/variables-section.tsx"
import { DisplayOrderSection } from "./components/manage/sections/display-order-section.tsx"
import { AuditSection } from "./components/manage/sections/audit-section.tsx"
import { ModeratorsSection } from "./components/manage/sections/moderators-section.tsx"

// Admin
import { AdminLayout } from "./components/admin/admin-layout.tsx"
import { AdminHub } from "./components/admin/admin-hub.tsx"
import { TagsAdminPage } from "./components/admin/tags/tags-admin-page.tsx"
import { NavbarAdminPage } from "./components/admin/navbar/navbar-admin-page.tsx"
import { BotSessionPage } from "./components/admin/thpsbot/bot-session-page.tsx"
import { ReconcilePage } from "./components/admin/reconcile/reconcile-page.tsx"
import { ReconcileDetailPage } from "./components/admin/reconcile/reconcile-detail-page.tsx"
import { GameDisplayPage } from "./components/admin/game-display/game-display-page.tsx"
import { GameDisplayDetailPage } from "./components/admin/game-display/game-display-detail-page.tsx"
import { UsersAdminPage } from "./components/admin/users/users-admin-page.tsx"
import { UsersAdminDetailPage } from "./components/admin/users/users-admin-detail.tsx"

// Legal / misc
import { ChangelogRedirect } from "./components/legal/changelog-redirect.tsx"
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
            { path: "changelog", Component: ChangelogRedirect },
            { path: "src", element: <SocialRedirect platform="Speedrun" /> },
            { path: "discord", element: <SocialRedirect platform="Discord" /> },
            { path: "bluesky", element: <SocialRedirect platform="Bluesky" /> },
            { path: "youtube", element: <SocialRedirect platform="YouTube" /> },
            { path: "twitch", element: <SocialRedirect platform="Twitch" /> },
            { path: "*", Component: NotFoundPage },
        ],
    },
])
