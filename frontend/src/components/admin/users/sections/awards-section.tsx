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
import { QueryErrorBanner } from "@/components/common/query-error-banner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAwardsAll } from "@/hooks/awards/useAwardsAll"
import { usePlayerProfile } from "@/hooks/player/usePlayerProfile"
import {
    useGrantAward,
    useRevokeAward,
    useUserAwards,
} from "@/hooks/admin/useAdminUsers"
import { cn } from "@/lib/utils"

interface AwardsSectionProps {
    ident: string
}

export function AwardsSection({ ident }: AwardsSectionProps) {
    const held = useUserAwards(ident)
    const all = useAwardsAll()
    const profile = usePlayerProfile(ident, { enabled: Boolean(ident) })
    const playerName =
        profile.data?.player.nickname ?? profile.data?.player.name ?? ident
    const grant = useGrantAward(ident, playerName)
    const revoke = useRevokeAward(ident, playerName)

    const [pickerQuery, setPickerQuery] = useState("")

    const heldIds = useMemo(
        () => new Set((held.data ?? []).map((a) => a.award_id)),
        [held.data],
    )

    const candidates = useMemo(() => {
        const list = all.data ?? []
        return list.filter((a) => !heldIds.has(a.id))
    }, [all.data, heldIds])

    return (
        <Panel className="p-5 w-full">
            <div className="mb-3">
                <h3 className="text-lg font-semibold">Awards</h3>
            </div>

            {held.error && (
                <QueryErrorBanner
                    error={held.error}
                    onRetry={held.refetch}
                />
            )}

            <div className="mb-4">
                <Command shouldFilter={true} className="border rounded-md">
                    <CommandInput
                        value={pickerQuery}
                        onValueChange={setPickerQuery}
                        placeholder="Grant an award..."
                    />
                    {pickerQuery.length > 0 && (
                        <CommandList>
                            <CommandEmpty>No awards found with information given.</CommandEmpty>
                            <CommandGroup>
                                {candidates.map((award) => (
                                    <CommandItem
                                        key={award.id}
                                        value={award.name}
                                        disabled={grant.isPending}
                                        onSelect={() => {
                                            grant.mutate({
                                                award_id: award.id,
                                                award_name: award.name,
                                            })
                                            setPickerQuery("")
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span>{award.name}</span>
                                            {award.description && (
                                                <span
                                                    className={cn(
                                                        "text-xs",
                                                        "text-muted-foreground",
                                                    )}
                                                >
                                                    {award.description}
                                                </span>
                                            )}
                                        </div>
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
                            <TableHead>Award</TableHead>
                            <TableHead className="w-30 text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {held.isLoading ? (
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
                        ) : (held.data ?? []).length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={2}
                                    className={cn(
                                        "text-center py-6",
                                        "text-muted-foreground",
                                    )}
                                >
                                    {playerName} has no awards... yet?
                                </TableCell>
                            </TableRow>
                        ) : (
                            (held.data ?? []).map((award) => (
                                <TableRow key={award.award_id}>
                                    <TableCell>{award.award_name}</TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1"
                                            disabled={
                                                revoke.isPending &&
                                                revoke.variables?.award_id ===
                                                    award.award_id
                                            }
                                            onClick={() =>
                                                revoke.mutate(award)
                                            }
                                        >
                                            <X className="size-3" />
                                            Revoke
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
