import { useMemo, useState } from "react"
import { Loader2, X } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/ui/query-error-banner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useGames } from "@/hooks/game/useGames"
import { usePlayerProfile } from "@/hooks/player/usePlayerProfile"
import {
    useAddModerator,
    useRemoveModerator,
    useUserModerates,
} from "@/hooks/admin/useAdminUsers"
import { cn } from "@/lib/utils"

interface ModeratesSectionProps {
    ident: string
}

export function ModeratesSection({ ident }: ModeratesSectionProps) {
    const moderates = useUserModerates(ident)
    const games = useGames()
    const profile = usePlayerProfile(ident, { enabled: Boolean(ident) })
    const playerName =
        profile.data?.player.nickname ?? profile.data?.player.name ?? ident
    const addMod = useAddModerator(ident, playerName)
    const removeMod = useRemoveModerator(ident, playerName)

    const [pickerQuery, setPickerQuery] = useState("")

    const ownedIds = useMemo(
        () => new Set((moderates.data ?? []).map((g) => g.game_id)),
        [moderates.data],
    )

    const candidates = useMemo(() => {
        const all = games.data ?? []
        return all.filter((g) => !ownedIds.has(g.id))
    }, [games.data, ownedIds])

    return (
        <Panel className="p-5 w-full">
            <div className="mb-3">
                <h3 className="text-lg font-semibold">Moderated Games</h3>
            </div>

            {moderates.error && (
                <QueryErrorBanner
                    error={moderates.error}
                    onRetry={moderates.refetch}
                />
            )}

            <div className="mb-4">
                <Command shouldFilter={true} className="border rounded-md">
                    <CommandInput
                        value={pickerQuery}
                        onValueChange={setPickerQuery}
                        placeholder="Add a game..."
                    />
                    {pickerQuery.length > 0 && (
                        <CommandList>
                            <CommandEmpty>No games found with information given.</CommandEmpty>
                            <CommandGroup>
                                {candidates.map((game) => (
                                    <CommandItem
                                        key={game.id}
                                        value={game.name}
                                        disabled={addMod.isPending}
                                        onSelect={() => {
                                            addMod.mutate({
                                                game_id: game.id,
                                                game_name: game.name,
                                            })
                                            setPickerQuery("")
                                        }}
                                    >
                                        {game.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    )}
                </Command>
            </div>

            <div
                className={cn(
                    "rounded-md border border-border/40",
                    "overflow-hidden",
                )}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/20">
                            <TableHead>Game</TableHead>
                            <TableHead className="w-30 text-center">
                                Remove?
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {moderates.isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={2}
                                    className="text-center py-6"
                                >
                                    <Loader2
                                        className={cn(
                                            "size-4 animate-spin",
                                            "inline",
                                        )}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (moderates.data ?? []).length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={2}
                                    className={cn(
                                        "text-center py-6",
                                        "text-muted-foreground",
                                    )}
                                >
                                    {playerName} doesn't moderate any games.
                                </TableCell>
                            </TableRow>
                        ) : (
                            (moderates.data ?? []).map((game) => (
                                <TableRow key={game.game_id}>
                                    <TableCell>{game.game_name}</TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1"
                                            disabled={
                                                removeMod.isPending &&
                                                removeMod.variables?.game_id ===
                                                    game.game_id
                                            }
                                            onClick={() =>
                                                removeMod.mutate(game)
                                            }
                                        >
                                            <X className="size-3" />
                                            Remove
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </Panel>
    )
}
