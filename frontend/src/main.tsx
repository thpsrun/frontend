import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import './index.css'
import App from './App.tsx'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router";
import { MainPage } from './components/main-page.tsx'
import { GameOverview } from './components/game-overview.tsx'
import { LoginPage } from './components/login-page.tsx'
import { RegisterPage } from './components/register-page.tsx'
import { OAuthCancelledPage } from './components/oauth-cancelled-page.tsx'
import { OAuthErrorPage } from './components/oauth-error-page.tsx'
import { ProfileSettings } from './components/profile-settings.tsx'
import { PlayerProfile } from './components/player-profile.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            { index: true, Component: MainPage },
            { path: "game/:gameSlug", Component: GameOverview },
            { path: "login", Component: LoginPage },
            { path: "register", Component: RegisterPage },
            { path: "login/cancelled", Component: OAuthCancelledPage },
            { path: "login/error", Component: OAuthErrorPage },
            { path: "profile/settings", Component: ProfileSettings },
            { path: "player/:playerName", Component: PlayerProfile },
        ]
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <JotaiProvider>
                <RouterProvider router={router} />
            </JotaiProvider>
        </QueryClientProvider>
    </StrictMode>,
)
