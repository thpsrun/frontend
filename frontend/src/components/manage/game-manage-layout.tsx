import { useParams, Navigate, useLocation } from "react-router"
import {
    SidebarLayout,
    type NavGroup,
} from "@/components/layout/sidebar-layout"
import { GameCardPanel } from "@/components/game/game-sidebar"
import { useIsGameMod } from "@/hooks/game/useIsGameMod"
import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useHasCapability } from "@/hooks/auth/useHasCapability"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { sectionTitle } from "@/lib/page-title"

const MANAGE_LABELS: Record<string, string> = {
    general: "General",
    timing: "Timing",
    categories: "Categories",
    variables: "Variables",
    audit: "Audit",
    moderators: "Moderators",
    "display-order": "Display Order",
}

export function GameManageLayout() {
    const { gameSlug } = useParams<{ gameSlug: string }>()
    const { pathname } = useLocation()
    useDocumentTitle(
        sectionTitle(pathname, `/${gameSlug}/manage`, "Manage", MANAGE_LABELS),
    )
    const { isMod, isLoading } = useIsGameMod(gameSlug)
    const { player } = useCurrentPlayer()
    const {
        data: gameDetail,
        isLoading: gameLoading,
    } = useGameDetail(gameSlug ?? "")
    const hasAuditCap = useHasCapability("games.audit.view", gameDetail?.id)

    // Wait for the profile before reading isMod, otherwise a legitimate moderator would be
    // bounced to the game page while the session query is still in flight.
    if (isLoading) return null
    if (!gameSlug) return <Navigate to="/" replace />
    if (!isMod) return <Navigate to={`/${gameSlug}`} replace />

    const isSuperuser = !!player?.player.is_superuser
    const canViewAudit = hasAuditCap || isSuperuser

    const navGroups: ReadonlyArray<NavGroup> = [
        {
            heading: "Game",
            items: [
                {
                    label: "General",
                    to: `/${gameSlug}/manage/general`,
                },
                {
                    label: "Game Rules",
                    to: `/${gameSlug}/manage/timing`,
                },
                {
                    label: "Categories",
                    to: `/${gameSlug}/manage/categories`,
                },
                {
                    label: "Variables",
                    to: `/${gameSlug}/manage/variables`,
                },
                ...(canViewAudit ? [{
                    label: "Audit Log",
                    to: `/${gameSlug}/manage/audit`,
                }] : []),
            ],
        },
        ...(isSuperuser ? [{
            heading: "Superadmin",
            items: [
                {
                    label: "Moderators",
                    to: `/${gameSlug}/manage/moderators`,
                },
                {
                    label: "Display Order",
                    to: `/${gameSlug}/manage/display-order`,
                },
            ],
        }] : []),
    ]

    return (
        <SidebarLayout
            navGroups={navGroups}
            indexPath={`/${gameSlug}/manage`}
            redirectTo={`/${gameSlug}/manage/general`}
            maxWidth="max-w-400"
            rightSidebar={
                <GameCardPanel
                    gameSlug={gameSlug}
                    gameDetail={gameDetail}
                    gameLoading={gameLoading}
                    isILView={false}
                    isManageView
                />
            }
        />
    )
}
