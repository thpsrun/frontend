import { useParams, Navigate } from "react-router"
import {
    SidebarLayout,
    type NavGroup,
} from "@/components/layout/sidebar-layout"
import { GameCardPanel } from "@/components/game/game-sidebar"
import { useIsGameMod } from "@/hooks/game/useIsGameMod"
import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useHasCapability } from "@/hooks/auth/useHasCapability"

export function GameManageLayout() {
    const { gameSlug } = useParams<{ gameSlug: string }>()
    const { isMod, isLoading } = useIsGameMod(gameSlug)
    const { player } = useCurrentPlayer()
    const {
        data: gameDetail,
        isLoading: gameLoading,
    } = useGameDetail(gameSlug ?? "")
    const hasAuditCap = useHasCapability("games.audit.view", gameDetail?.id)

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
                    label: "Audit log",
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
