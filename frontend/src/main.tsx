import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider as JotaiProvider } from "jotai"
import "./index.css"
import App from "./App.tsx"
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router";
import { MainPage } from "./components/home/main-page.tsx"
import { GameOverview } from "./components/game/game-overview.tsx"
import { LoginPage } from "./components/auth/login-page.tsx"
import { RegisterPage } from "./components/auth/register-page.tsx"
import { OAuthCancelledPage } from "./components/auth/oauth-cancelled-page.tsx"
import { OAuthErrorPage } from "./components/auth/oauth-error-page.tsx"
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
import { DangerSection } from "./components/profile/sections/danger-section.tsx"

const queryClient = new QueryClient()

const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            { index: true, Component: MainPage },
            { path: ":gameSlug/*", Component: GameOverview },
            { path: "login", Component: LoginPage },
            { path: "register", Component: RegisterPage },
            { path: "login/cancelled", Component: OAuthCancelledPage },
            { path: "login/error", Component: OAuthErrorPage },
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
                            { path: "danger", Component: DangerSection },
                        ],
                    },
                    { path: "submissions", Component: SubmissionsHub },
                    { path: "admin", Component: AdminHub },
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
