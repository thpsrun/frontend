import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { Search, ChevronsUpDown, X } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGames } from "@/hooks/game/useGames"
import { useTags } from "@/hooks/guides/useTags"

export interface FiltersState {
    game: string | undefined
    tagSlugs: string[]
    query: string
}

interface Props {
    pinnedGameSlug?: string
    onChange: (state: FiltersState) => void
}

export function GuidesTableFilters({ pinnedGameSlug, onChange }: Props) {
    const [searchParams, setSearchParams] = useSearchParams()
    const games = useGames()
    const tags = useTags()

    const initialGame = pinnedGameSlug ?? searchParams.get("game") ?? undefined
    const initialTags = (searchParams.get("tag") ?? "")
        .split(",")
        .filter(Boolean)
    const initialQuery = searchParams.get("q") ?? ""

    const [game, setGame] = useState<string | undefined>(initialGame)
    const [tagSlugs, setTagSlugs] = useState<string[]>(initialTags)
    const [queryInput, setQueryInput] = useState<string>(initialQuery)
    const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery)

    // debounce query
    const debounceRef = useRef<number | null>(null)
    useEffect(() => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current)
        debounceRef.current = window.setTimeout(() => {
            setDebouncedQuery(queryInput)
        }, 200)
        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current)
        }
    }, [queryInput])

    // bubble state up + reflect into URL (skip game when pinned)
    useEffect(() => {
        onChange({ game, tagSlugs, query: debouncedQuery })
        const next = new URLSearchParams(searchParams)
        if (!pinnedGameSlug) {
            if (game) next.set("game", game)
            else next.delete("game")
        }
        if (tagSlugs.length > 0) next.set("tag", tagSlugs.join(","))
        else next.delete("tag")
        if (debouncedQuery) next.set("q", debouncedQuery)
        else next.delete("q")
        setSearchParams(next, { replace: true })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game, tagSlugs, debouncedQuery])

    const tagsList = useMemo(() => tags.data ?? [], [tags.data])
    const selectedTags = useMemo(
        () => tagsList.filter((t) => tagSlugs.includes(t.slug)),
        [tagsList, tagSlugs],
    )

    function toggleTag(slug: string) {
        setTagSlugs((prev) =>
            prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {!pinnedGameSlug && (
                <Select
                    value={game ?? "__all"}
                    onValueChange={(v) => setGame(v === "__all" ? undefined : v)}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All games" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__all">All games</SelectItem>
                        {(games.data ?? []).map((g) => (
                            <SelectItem key={g.slug} value={g.slug}>
                                {g.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="min-w-48 justify-between gap-2"
                    >
                        <span className="flex flex-wrap items-center gap-1">
                            {selectedTags.length === 0
                                ? <span className="text-muted-foreground">All tags</span>
                                : selectedTags.map((t) => (
                                    <Badge key={t.slug} variant="secondary" className="gap-1">
                                        {t.name}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleTag(t.slug)
                                            }}
                                            aria-label={`Remove ${t.name}`}
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                        </span>
                        <ChevronsUpDown className="size-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                    <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandList>
                            <CommandEmpty>No tags found.</CommandEmpty>
                            <CommandGroup>
                                {tagsList.map((t) => {
                                    const checked = tagSlugs.includes(t.slug)
                                    return (
                                        <CommandItem
                                            key={t.slug}
                                            value={`${t.name} ${t.slug}`}
                                            onSelect={() => toggleTag(t.slug)}
                                        >
                                            <span
                                                className={`mr-2 inline-flex size-4 items-center justify-center rounded border ${
                                                    checked
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "border-border"
                                                }`}
                                                aria-hidden
                                            >
                                                {checked ? "✓" : ""}
                                            </span>
                                            {t.name}
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="Search..."
                    className="w-64 pl-8"
                />
            </div>
        </div>
    )
}
