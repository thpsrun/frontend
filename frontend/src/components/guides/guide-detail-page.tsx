import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { useGuide } from "@/hooks/guides/useGuide"
import { useGuides } from "@/hooks/guides/useGuides"
import { useDeleteGuide } from "@/hooks/guides/useDeleteGuide"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { ApiError } from "@/lib/api-client"
import type { Guide } from "@/types/guides"
import { GuideMarkdown } from "./guide-markdown"
import { GuideToc } from "./guide-toc"
import { DeleteGuideDialog } from "./delete-guide-dialog"

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

let warnedAboutFallback = false
function warnFallbackOnce() {
    if (warnedAboutFallback) return
    warnedAboutFallback = true
    console.warn(
        "[guides] backend response missing can_edit — using is_superuser/moderated_games fallback. Owner-edit branch is not detectable client-side.",
    )
}

export function GuideDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const { player } = useCurrentPlayer()
    const isSuperuser = !!player?.player.is_superuser
    const moderatedSlugs = useMemo(
        () => (player?.moderation?.moderated_games ?? []).map((g) => g.slug),
        [player],
    )

    const { data: guide, isLoading, isError, error } = useGuide(slug)
    const siblings = useGuides({
        game: guide?.game?.slug,
        enabled: !!guide?.game?.slug,
    })
    const del = useDeleteGuide()
    const [showDelete, setShowDelete] = useState(false)

    useEffect(() => {
        if (guide && typeof guide.can_edit !== "boolean") warnFallbackOnce()
    }, [guide])

    if (isError) {
        const status = error instanceof ApiError ? error.status : null
        if (status === 404 || status === 403) {
            return (
                <div className="container mx-auto max-w-3xl px-4 py-10">
                    <Panel className="p-10 text-center">
                        <h1 className="text-xl font-semibold">Guide not found</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This guide may have been removed or the URL is wrong.
                        </p>
                        <Button asChild className="mt-4">
                            <Link to="/guides">Back to guides</Link>
                        </Button>
                    </Panel>
                </div>
            )
        }
        return (
            <div className="container mx-auto max-w-3xl px-4 py-10">
                <Panel className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : "Couldn't load this guide."}
                    </p>
                </Panel>
            </div>
        )
    }

    if (isLoading || !guide) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-10">
                <div className="space-y-3">
                    <div className="h-8 w-2/3 animate-pulse rounded bg-muted/40" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted/40" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-muted/40" />
                </div>
            </div>
        )
    }

    const canEdit = canEditFallback(guide, isSuperuser, moderatedSlugs)
    const updatedDate = guide.updated_at ? new Date(guide.updated_at) : null
    const guideSlug = guide.slug

    async function onConfirmDelete() {
        try {
            await del.mutateAsync(guideSlug)
            toast.success("Guide deleted.")
            navigate("/guides")
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Delete failed.")
            throw e
        }
    }

    const moreSiblings = (siblings.data ?? [])
        .filter((g) => g.slug !== guide.slug)
        .slice(0, 5)

    return (
        <div className="container mx-auto max-w-6xl px-4 py-6">
            <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
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

            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-semibold">{guide.title}</h1>
                    <p className="mt-1 text-muted-foreground">{guide.short_description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        {guide.game && (
                            <Link to={`/${guide.game.slug}`}>
                                <Badge variant="outline">{guide.game.name}</Badge>
                            </Link>
                        )}
                        {(guide.tags ?? []).map((t) => (
                            <Badge key={t.slug} variant="secondary">{t.name}</Badge>
                        ))}
                        {guide.author?.username && (
                            <span className="text-muted-foreground">
                                by{" "}
                                <Link
                                    to={`/players/${guide.author.username}`}
                                    className="text-foreground hover:underline"
                                >
                                    {guide.author.username}
                                </Link>
                            </span>
                        )}
                        {updatedDate && (
                            <span className="text-muted-foreground" title={updatedDate.toLocaleString()}>
                                Updated {updatedDate.toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                {canEdit && (
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link to={`/guides/${guide.slug}/edit`}>
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

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_14rem]">
                <article className="min-w-0">
                    <GuideMarkdown content={guide.content} />
                </article>
                <aside className="hidden lg:block">
                    <div className="sticky top-20">
                        <GuideToc content={guide.content} />
                    </div>
                </aside>
            </div>

            {moreSiblings.length > 0 && (
                <div className="mt-12">
                    <h2 className="mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                        More guides for {guide.game?.name ?? "this game"}
                    </h2>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {moreSiblings.map((g) => (
                            <li key={g.slug}>
                                <Link
                                    to={`/guides/${g.slug}`}
                                    className="block rounded-md border border-border p-3 hover:bg-muted/30"
                                >
                                    <div className="font-medium">{g.title}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                        {g.short_description}
                                    </div>
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
