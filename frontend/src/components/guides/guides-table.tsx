import { useMemo, useState } from "react"
import { Link } from "react-router"
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
import { useTags } from "@/hooks/guides/useTags"
import type { GuideListItem, Tag } from "@/types/guides"
import { GuideTableSkeleton } from "./guide-table-skeleton"
import { GradientUsername } from "@/components/profile/gradient-username"
import { EmptyState } from "@/components/common/empty-state"
import { buildGuideUrl, resolveGuideTags } from "@/lib/guide-urls"
import { cn, truncate } from "@/lib/utils"

type SortKey = "title" | "updated"
type SortDir = "asc" | "desc"

interface FiltersState {
    game: string | undefined
    tagSlugs: string[]
    query: string
}

interface Props {
    pinnedGameSlug?: string
    pinnedAuthorId?: string
    filters: FiltersState
    emptyState?: { title: string; description?: string; action?: React.ReactNode }
}

function relativeTime(iso: string | null): { rel: string; abs: string } {
    if (!iso) return { rel: "-", abs: "" }
    const d = new Date(iso)
    if (isNaN(d.getTime())) return { rel: "-", abs: "" }
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
    pinnedAuthorId,
    filters,
    emptyState,
}: Props) {
    const showGameColumn = !pinnedGameSlug
    const [sortKey, setSortKey] = useState<SortKey>("updated")
    const [sortDir, setSortDir] = useState<SortDir>("desc")

    const tagFilter = filters.tagSlugs[0]  // backend supports a single tag filter
    const { data, isLoading, isError, error, refetch } = useGuides({
        game: pinnedGameSlug ?? filters.game,
        tag: tagFilter,
        playerId: pinnedAuthorId,
    })
    const tagsList = useTags()

    const sorted = useMemo(() => {
        const list = (data ?? []).filter((g) => {
            if (filters.tagSlugs.length > 1) {
                const slugs = resolveGuideTags(g.tags, tagsList.data).map((t) => t.slug)
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
    }, [data, sortKey, sortDir, filters, tagsList.data])

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

    if (!isLoading && sorted.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title={emptyState?.title ?? "No guides match the filters."}
                description={emptyState?.description}
                action={emptyState?.action}
            />
        )
    }

    return (
        <Panel className="overflow-hidden p-0">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/20">
                        <TableHead>
                            <button
                                type="button"
                                onClick={() => toggleSort("title")}
                                aria-label={`Sort by guide title${sortKey === "title" ? ` (${sortDir === "asc" ? "ascending" : "descending"})` : ""}`}
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
                                aria-label={`Sort by updated date${sortKey === "updated" ? ` (${sortDir === "asc" ? "ascending" : "descending"})` : ""}`}
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
                    : (
                        <TableBody>
                            {sorted.map((g, idx) => (
                                <GuideRow
                                    key={g.slug}
                                    guide={g}
                                    idx={idx}
                                    showGameColumn={showGameColumn}
                                    masterTags={tagsList.data}
                                />
                            ))}
                        </TableBody>
                    )}
            </Table>
        </Panel>
    )
}

interface RowProps {
    guide: GuideListItem
    idx: number
    showGameColumn: boolean
    masterTags: Tag[] | undefined
}

function GuideRow({ guide, idx, showGameColumn, masterTags }: RowProps) {
    const updated = relativeTime(guide.updated_at)
    const rowTags = resolveGuideTags(guide.tags, masterTags)
    return (
        <TableRow className={cn(
            "transition hover:bg-muted/30",
            idx % 2 === 1 ? "bg-muted/10" : "",
        )}>
            <TableCell className="max-w-160">
                <Link
                    to={buildGuideUrl(guide)}
                    className="font-semibold hover:underline"
                >
                    {guide.title}
                </Link>
                <div className="line-clamp-2 text-sm text-muted-foreground">
                    {truncate(guide.short_description, 50)}
                </div>
                {rowTags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {rowTags.map((t) => (
                            <Badge key={t.slug} variant="secondary">{t.name}</Badge>
                        ))}
                    </div>
                )}
            </TableCell>
            {showGameColumn && (
                <TableCell>
                    {guide.game
                        ? (
                            <Link
                                to={`/${guide.game.slug}`}
                                className="text-link hover:underline"
                            >
                                {guide.game.name}
                            </Link>
                        )
                        : <span className="text-muted-foreground">-</span>}
                </TableCell>
            )}
            <TableCell>
                {guide.author?.name
                    ? (
                        <Link
                            to={`/player/${guide.author.name}`}
                            className="hover:underline"
                        >
                            <GradientUsername
                                name={guide.author.nickname || guide.author.name}
                                gradients={guide.author.gradients ?? null}
                            />
                        </Link>
                    )
                    : <span className="text-muted-foreground">-</span>}
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm">
                <span title={updated.abs}>{updated.rel}</span>
            </TableCell>
        </TableRow>
    )
}
