import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AlertBanner } from "@/components/common/alert-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { useGuide } from "@/hooks/guides/useGuide"
import { useGuides } from "@/hooks/guides/useGuides"
import { useTags } from "@/hooks/guides/useTags"
import { useDeleteGuide } from "@/hooks/guides/useDeleteGuide"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { ApiError } from "@/lib/api-client"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { cn } from "@/lib/utils"
import { buildGuideEditUrl, buildGuideUrl, resolveGuideTags } from "@/lib/guide-urls"
import type { Guide } from "@/types/guides"
import { GuideMarkdown } from "./guide-markdown"
import { GuideToc } from "./guide-toc"
import { extractTocHeadings, TOC_MIN_HEADINGS } from "./guide-toc-headings"
import { DeleteGuideDialog } from "./delete-guide-dialog"
import { PlayerLink } from "@/components/common/player-link"

// Older backend responses can omit can_edit; fall back to superuser and game-moderator checks.
// The author-owns-it case is not detectable client-side, so authors may not see their edit
// buttons when the flag is missing (see warnFallbackOnce).
function canEditFallback(
    guide: Guide,
    isSuperuser: boolean,
    moderatedSlugs: string[],
): boolean {
    if (typeof guide.can_edit === "boolean") return guide.can_edit
    if (isSuperuser) return true
    if (guide.game?.slug && moderatedSlugs.includes(guide.game.slug)) return true
    return false
}

// Module-level flag so the warning logs once per page load, not on every render.
let warnedAboutFallback = false
function warnFallbackOnce() {
    if (warnedAboutFallback) return
    warnedAboutFallback = true
    console.warn(
        "[guides] backend response missing can_edit - using is_superuser/moderated_games fallback. Owner-edit branch is not detectable client-side.",
    )
}

export function GuideDetailPage() {
    const { gameSlug, guideSlug } = useParams<{ gameSlug: string; guideSlug: string }>()
    const navigate = useNavigate()
    const { player } = useCurrentPlayer()
    const isSuperuser = !!player?.player.is_superuser
    const moderatedSlugs = useMemo(
        () => (player?.moderation?.moderated_games ?? []).map((g) => g.slug),
        [player],
    )

    const { data: guide, isLoading, isError, error } = useGuide(guideSlug)
    const tags = useTags()
    const siblings = useGuides({
        game: guide?.game?.slug,
        enabled: !!guide?.game?.slug,
    })
    const del = useDeleteGuide()
    const [showDelete, setShowDelete] = useState(false)

    useEffect(() => {
        if (guide && typeof guide.can_edit !== "boolean") warnFallbackOnce()
    }, [guide])

    // Computed before the early returns so useDocumentTitle runs unconditionally (hooks must be
    // called in the same order every render). 403 is treated the same as 404: guides the viewer
    // can't access render as not found rather than as a permission error.
    const guideNotFound =
        isError
        && error instanceof ApiError
        && (error.status === 404 || error.status === 403)
    useDocumentTitle(guide?.title ?? (guideNotFound ? "Guide Not Found" : undefined))

    if (isError) {
        const status = error instanceof ApiError ? error.status : null
        if (status === 404 || status === 403) {
            return (
                <div className="container mx-auto max-w-3xl px-4">
                    <AlertBanner variant="error">
                        Guide not found. This guide may have been removed or the URL is wrong.
                    </AlertBanner>
                    <div className="mt-4">
                        <Button asChild>
                            <Link to="/guides">Back to guides</Link>
                        </Button>
                    </div>
                </div>
            )
        }
        return (
            <div className="container mx-auto max-w-3xl px-4">
                <AlertBanner variant="error">
                    {error instanceof Error ? error.message : "Couldn't load this guide."}
                </AlertBanner>
            </div>
        )
    }

    if (isLoading || !guide) {
        return (
            <div className="container mx-auto max-w-5xl px-4">
                <Panel className="space-y-3">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </Panel>
            </div>
        )
    }

    const canEdit = canEditFallback(guide, isSuperuser, moderatedSlugs)
    const updatedDate = guide.updated_at ? new Date(guide.updated_at) : null
    const slug = guide.slug

    // Guides are fetched by slug alone, so a wrong game segment in the URL still resolves.
    // Redirect to the canonical /guides/:game/:slug URL instead of rendering under it.
    if (
        guide.game?.slug
        && gameSlug
        && gameSlug !== guide.game.slug
    ) {
        return <Navigate to={buildGuideUrl(guide)} replace />
    }

    async function onConfirmDelete() {
        try {
            await del.mutateAsync(slug)
            toast.success("Guide deleted.")
            navigate("/guides")
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Delete failed.")
            // Rethrow so ConfirmDeleteDialog stays open and shows the error inline.
            throw e
        }
    }

    const resolvedTags = resolveGuideTags(guide.tags, tags.data)
    const moreSiblings = (siblings.data ?? [])
        .filter((g) => g.slug !== guide.slug)
        .slice(0, 5)
    const tocHeadings = extractTocHeadings(guide.content)
    const showToc = tocHeadings.length >= TOC_MIN_HEADINGS

    return (
        <div className="container mx-auto max-w-6xl px-4 space-y-6">
            <Panel className="px-4 py-2">
                <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
                    <Link to="/guides" className="hover:underline">Guides</Link>
                    {guide.game && (
                        <>
                            <span className="mx-1">›</span>
                            <Link to={`/${guide.game.slug}`} className="hover:underline">
                                {guide.game.name}
                            </Link>
                        </>
                    )}
                    <span className="mx-1">›</span>
                    <span className="text-foreground">{guide.title}</span>
                </nav>
            </Panel>

            <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-semibold">{guide.title}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            {guide.game && (
                                <Link
                                    to={`/${guide.game.slug}`}
                                    className="text-link hover:underline"
                                >
                                    {guide.game.name}
                                </Link>
                            )}
                            {guide.author?.name && (
                                <span className="text-muted-foreground">
                                    by{" "}
                                    <PlayerLink
                                        name={guide.author.name}
                                        nickname={guide.author.nickname}
                                        gradients={guide.author.gradients}
                                    />
                                </span>
                            )}
                            {updatedDate && (
                                <>
                                    <span className="text-muted-foreground/50" aria-hidden>·</span>
                                    <span className="text-muted-foreground" title={updatedDate.toLocaleString()}>
                                        Updated {updatedDate.toLocaleDateString()}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            {resolvedTags.map((t) => (
                                <Badge key={t.slug} variant="secondary">{t.name}</Badge>
                            ))}
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link to={buildGuideEditUrl(guide)}>
                                    <Pencil className="mr-2 size-4" />Edit
                                </Link>
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDelete(true)}
                            >
                                <Trash2 className="mr-2 size-4" />Delete
                            </Button>
                        </div>
                    )}
                </div>
            </Panel>

            <div
                className={cn(
                    "grid grid-cols-1 gap-6",
                    showToc && "lg:grid-cols-[minmax(0,1fr)_14rem]",
                )}
            >
                <Panel className="p-6">
                    <article className="min-w-0">
                        <GuideMarkdown content={guide.content} />
                    </article>
                </Panel>
                {showToc && (
                    <aside className="hidden lg:block">
                        <Panel className="sticky top-20">
                            <GuideToc headings={tocHeadings} />
                        </Panel>
                    </aside>
                )}
            </div>

            {moreSiblings.length > 0 && (
                <div>
                    <h2 className="mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                        More guides for {guide.game?.name ?? "this game"}
                    </h2>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {moreSiblings.map((g) => (
                            <li key={g.slug}>
                                <Link to={buildGuideUrl(g)} className="block">
                                    <Panel className="p-3 hover:bg-muted/30">
                                        <div className="font-medium">{g.title}</div>
                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                            {g.short_description}
                                        </div>
                                    </Panel>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <DeleteGuideDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                guideTitle={guide.title}
                onConfirm={onConfirmDelete}
                isPending={del.isPending}
            />
        </div>
    )
}
