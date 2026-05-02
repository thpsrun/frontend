import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { ArrowUp, ArrowDown, FileText, RefreshCw } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { useGuides } from "@/hooks/guides/useGuides"
import type { GuideListItem } from "@/types/guides"
import { GuideTableSkeleton } from "./guide-table-skeleton"
import { EmptyState } from "./empty-state"
import { cn } from "@/lib/utils"

type SortKey = "title" | "updated"
type SortDir = "asc" | "desc"

interface FiltersState {
    game: string | undefined
    tagSlugs: string[]
    query: string
}

interface Props {
    pinnedGameSlug?: string
    pinnedAuthorUsername?: string
    filters: FiltersState
    emptyState?: { title: string; description?: string; action?: React.ReactNode }
}

function relativeTime(iso: string | null): { rel: string; abs: string } {
    if (!iso) return { rel: "—", abs: "" }
    const d = new Date(iso)
    if (isNaN(d.getTime())) return { rel: "—", abs: "" }
    const diff = (Date.now() - d.getTime()) / 1000
    const abs = d.toLocaleString()
    if (diff < 60) return { rel: "just now", abs }
    if (diff < 3600) return { rel: `${Math.floor(diff / 60)}m ago`, abs }
    if (diff < 86_400) return { rel: `${Math.floor(diff / 3600)}h ago`, abs }
    if (diff < 86_400 * 30) return { rel: `${Math.floor(diff / 86_400)}d ago`, abs }
    if (diff < 86_400 * 365) return { rel: `${Math.floor(diff / (86_400 * 30))}mo ago`, abs }
    return { rel: `${Math.floor(diff / (86_400 * 365))}y ago`, abs }
}

export function GuidesTable({
    pinnedGameSlug,
    pinnedAuthorUsername,
    filters,
    emptyState,
}: Props) {
    const navigate = useNavigate()
    const showGameColumn = !pinnedGameSlug
    const [sortKey, setSortKey] = useState<SortKey>("updated")
    const [sortDir, setSortDir] = useState<SortDir>("desc")

    const tagFilter = filters.tagSlugs[0]  // backend supports a single tag filter
    const { data, isLoading, isError, error, refetch } = useGuides({
        game: pinnedGameSlug ?? filters.game,
        tag: tagFilter,
    })

    const sorted = useMemo(() => {
        const list = (data ?? []).filter((g) => {
            if (pinnedAuthorUsername && g.author?.username !== pinnedAuthorUsername) {
                return false
            }
            if (filters.tagSlugs.length > 1) {
                const slugs = (g.tags ?? []).map((t) => t.slug)
                if (!filters.tagSlugs.every((s) => slugs.includes(s))) return false
            }
            if (filters.query) {
                const q = filters.query.toLowerCase()
                const hay = `${g.title} ${g.short_description}`.toLowerCase()
                if (!hay.includes(q)) return false
            }
            return true
        })
        list.sort((a, b) => {
            if (sortKey === "title") {
                return sortDir === "asc"
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title)
            }
            const aT = a.updated_at ? Date.parse(a.updated_at) : 0
            const bT = b.updated_at ? Date.parse(b.updated_at) : 0
            return sortDir === "asc" ? aT - bT : bT - aT
        })
        return list
    }, [data, sortKey, sortDir, filters, pinnedAuthorUsername])

    function toggleSort(key: SortKey) {
        if (key === sortKey) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        } else {
            setSortKey(key)
            setSortDir(key === "title" ? "asc" : "desc")
        }
    }

    if (isError) {
        return (
            <Panel className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Couldn't load guides."}
                </p>
                <Button onClick={() => refetch()} className="mt-3" variant="outline">
                    <RefreshCw className="mr-2 size-4" />Retry
                </Button>
            </Panel>
        )
    }

    return (
        <Panel className="overflow-hidden p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <button
                                type="button"
                                onClick={() => toggleSort("title")}
                                className="flex items-center gap-1 hover:text-foreground"
                            >
                                Guide
                                {sortKey === "title" && (
                                    sortDir === "asc"
                                        ? <ArrowUp className="size-3" />
                                        : <ArrowDown className="size-3" />
                                )}
                            </button>
                        </TableHead>
                        {showGameColumn && <TableHead>Game</TableHead>}
                        <TableHead>Author</TableHead>
                        <TableHead>
                            <button
                                type="button"
                                onClick={() => toggleSort("updated")}
                                className="flex items-center gap-1 hover:text-foreground"
                            >
                                Updated
                                {sortKey === "updated" && (
                                    sortDir === "asc"
                                        ? <ArrowUp className="size-3" />
                                        : <ArrowDown className="size-3" />
                                )}
                            </button>
                        </TableHead>
                    </TableRow>
                </TableHeader>

                {isLoading
                    ? <GuideTableSkeleton rows={5} showGameColumn={showGameColumn} />
                    : sorted.length === 0
                        ? null
                        : (
                            <TableBody>
                                {sorted.map((g) => (
                                    <GuideRow
                                        key={g.slug}
                                        guide={g}
                                        showGameColumn={showGameColumn}
                                        onOpen={() => navigate(`/guides/${g.slug}`)}
                                    />
                                ))}
                            </TableBody>
                        )}
            </Table>

            {!isLoading && sorted.length === 0 && (
                <div className="p-6">
                    <EmptyState
                        icon={<FileText className="size-8" />}
                        title={emptyState?.title ?? "No guides match the filters."}
                        description={emptyState?.description}
                        action={emptyState?.action}
                    />
                </div>
            )}
        </Panel>
    )
}

interface RowProps {
    guide: GuideListItem
    showGameColumn: boolean
    onOpen: () => void
}

function GuideRow({ guide, showGameColumn, onOpen }: RowProps) {
    const updated = relativeTime(guide.updated_at)
    return (
        <TableRow
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onOpen()
                }
            }}
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
        >
            <TableCell className="max-w-[40rem]">
                <div className="font-semibold">{guide.title}</div>
                <div className="line-clamp-2 text-sm text-muted-foreground">
                    {guide.short_description}
                </div>
                {guide.tags && guide.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {guide.tags.map((t) => (
                            <Badge key={t.slug} variant="secondary">{t.name}</Badge>
                        ))}
                    </div>
                )}
            </TableCell>
            {showGameColumn && (
                <TableCell>
                    {guide.game
                        ? (
                            <a
                                href={`/${guide.game.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className={cn("inline-flex")}
                            >
                                <Badge variant="outline">{guide.game.name}</Badge>
                            </a>
                        )
                        : <span className="text-muted-foreground">—</span>}
                </TableCell>
            )}
            <TableCell>
                {guide.author?.username
                    ? (
                        <a
                            href={`/players/${guide.author.username}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                        >
                            {guide.author.username}
                        </a>
                    )
                    : <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="whitespace-nowrap">
                <span title={updated.abs}>{updated.rel}</span>
            </TableCell>
        </TableRow>
    )
}
