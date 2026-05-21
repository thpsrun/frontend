import { useState } from "react"
import { useParams, Navigate } from "react-router"
import { toast } from "sonner"
import { UserIcon } from "lucide-react"

import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SectionPanel } from "@/components/profile/section-panel"
import { GradientUsername } from "@/components/profile/gradient-username"
import { BACKEND_URL } from "@/constants"

import { useGameModerators } from "@/hooks/game/useGameModerators"
import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useAddGameModerator } from "@/hooks/game/useAddGameModerator"
import { useRemoveGameModerator } from "@/hooks/game/useRemoveGameModerator"
import { usePlayerSearch } from "@/hooks/players/usePlayerSearch"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"

import type { GameModerator } from "@/types/moderators"
import type { PlayerSearchResult } from "@/types/submissions"

export function ModeratorsSection() {
    const { gameSlug } = useParams<{ gameSlug: string }>()
    const { player, isLoading: playerLoading } = useCurrentPlayer()

    if (playerLoading) return null
    if (!player?.player.is_superuser) {
        return <Navigate to={`/${gameSlug}/manage`} replace />
    }
    if (!gameSlug) return null

    return <ModeratorsContent gameSlug={gameSlug} />
}

interface ModeratorsContentProps {
    gameSlug: string
}

function ModeratorsContent({ gameSlug }: ModeratorsContentProps) {
    const mods = useGameModerators(gameSlug)
    const { data: game } = useGameDetail(gameSlug)
    const addMod = useAddGameModerator(gameSlug, game?.id)
    const removeMod = useRemoveGameModerator(gameSlug, game?.id)
    const [confirmTarget, setConfirmTarget] = useState<GameModerator | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const search = usePlayerSearch(searchQuery)
    const [picked, setPicked] = useState<PlayerSearchResult | null>(null)

    const existingIds = new Set((mods.data ?? []).map((m) => m.id))

    const onPromote = async () => {
        if (!picked) return
        try {
            await addMod.mutateAsync(picked.id)
            toast.success(`Promoted ${picked.name}.`)
            setPicked(null)
            setSearchQuery("")
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to promote."
            toast.error(msg)
        }
    }

    const onConfirmRemove = async () => {
        if (!confirmTarget) return
        try {
            await removeMod.mutateAsync(confirmTarget.id)
            toast.success(`Removed ${confirmTarget.name}.`)
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to remove."
            toast.error(msg)
        } finally {
            setConfirmTarget(null)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <SectionPanel
                title="Current moderators"
                description="People with moderator access for this game."
            >
                {mods.isLoading && (
                    <p className="text-sm text-muted-foreground">Loading.</p>
                )}
                {mods.error && (
                    <AlertBanner variant="error">
                        {mods.error.message}
                    </AlertBanner>
                )}
                {mods.data && mods.data.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No moderators assigned.
                    </p>
                )}
                {mods.data && mods.data.length > 0 && (
                    <ul className="flex flex-col divide-y divide-border/40">
                        {mods.data.map((m) => (
                            <li
                                key={m.id}
                                className="flex items-center justify-between gap-3 py-2"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {m.pfp ? (
                                        <img
                                            src={`${BACKEND_URL}${m.pfp}`}
                                            alt={m.name}
                                            className="size-9 shrink-0 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="size-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                                            <UserIcon className="size-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex flex-col min-w-0">
                                        <GradientUsername
                                            name={m.nickname || m.name}
                                            gradients={m.gradients}
                                            className="font-medium truncate"
                                        />
                                        {m.nickname && (
                                            <span className="text-xs text-muted-foreground truncate">
                                                {m.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setConfirmTarget(m)}
                                    disabled={removeMod.isPending}
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionPanel>

            <SectionPanel
                title="Add moderator"
                description="Search a player and promote them."
            >
                <div className="flex flex-col gap-3">
                    <Label htmlFor="mod-search">Player</Label>
                    <Input
                        id="mod-search"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setPicked(null)
                        }}
                        placeholder="Search by name."
                    />
                    {search.data && search.data.length > 0 && !picked && (
                        <ul className="flex flex-col divide-y divide-border/40 rounded-md border border-border">
                            {search.data
                                .filter((p) => !existingIds.has(p.id))
                                .map((p) => (
                                    <li
                                        key={p.id}
                                        className="flex items-center justify-between px-3 py-2"
                                    >
                                        <span>
                                            {p.nickname
                                                ? `${p.nickname} (${p.name})`
                                                : p.name}
                                        </span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setPicked(p)}
                                        >
                                            Pick
                                        </Button>
                                    </li>
                                ))}
                        </ul>
                    )}
                    {picked && (
                        <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
                            <span>
                                Selected: <strong>{picked.nickname || picked.name}</strong>
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPicked(null)}
                                >
                                    Clear
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={onPromote}
                                    disabled={addMod.isPending}
                                >
                                    {addMod.isPending ? "Promoting!" : "Promote"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SectionPanel>

            <AlertDialog
                open={!!confirmTarget}
                onOpenChange={(open) => !open && setConfirmTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove moderator?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmTarget
                                ? `${confirmTarget.nickname || confirmTarget.name} will lose moderator access to this game.`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmRemove}>
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
