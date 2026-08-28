import { Link, useParams } from "react-router"
import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { SectionPanel } from "@/components/profile/section-panel"
import { useGuide } from "@/hooks/guides/useGuide"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { ApiError } from "@/lib/api-client"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { buildGuideUrl } from "@/lib/guide-urls"
import { GuideForm } from "./guide-form"

interface Props {
    mode: "create" | "edit"
}

export function GuideFormPage({ mode }: Props) {
    const { gameSlug, guideSlug } = useParams<{ gameSlug: string; guideSlug: string }>()
    const { player } = useCurrentPlayer()
    useDocumentTitle(mode === "create" ? "New Guide" : "Edit Guide")

    if (mode === "create") {
        return (
            <div className="container mx-auto max-w-3xl px-4">
                <SectionPanel
                    title="New Guide"
                    description=""
                >
                    <GuideForm mode="create" />
                </SectionPanel>
            </div>
        )
    }

    return (
        <EditPage
            gameSlug={gameSlug ?? ""}
            slug={guideSlug ?? ""}
            isSuperuser={!!player?.player.is_superuser}
            moderatedSlugs={(player?.moderation?.moderated_games ?? []).map((g) => g.slug)}
        />
    )
}

// Split into a child component so useGuide is only mounted in edit mode; the create branch above
// returns early and hooks cannot be called conditionally within one component.
function EditPage({
    gameSlug,
    slug,
    isSuperuser,
    moderatedSlugs,
}: {
    gameSlug: string
    slug: string
    isSuperuser: boolean
    moderatedSlugs: string[]
}) {
    const { data: guide, isLoading, isError, error } = useGuide(gameSlug, slug)

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-3xl px-4">
                <Panel className="space-y-3">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-32 w-full" />
                </Panel>
            </div>
        )
    }

    if (isError || !guide) {
        const status = error instanceof ApiError ? error.status : null
        return (
            <div className="container mx-auto max-w-3xl px-4">
                <AlertBanner variant="error">
                    {status === 403 ? "You can't edit this guide." : "Guide not found."}
                </AlertBanner>
                <div className="mt-4">
                    <Button asChild>
                        <Link to="/guides">Back to guides</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Same fallback as canEditFallback in guide-detail-page: older backend responses can omit
    // can_edit, and the author-owns-it case is not detectable client-side.
    const canEdit = typeof guide.can_edit === "boolean"
        ? guide.can_edit
        : isSuperuser || (!!guide.game?.slug && moderatedSlugs.includes(guide.game.slug))

    if (!canEdit) {
        return (
            <div className="container mx-auto max-w-3xl px-4">
                <AlertBanner variant="error">
                    You can't edit this guide. Only the author, moderators of the game, or admins can make changes.
                </AlertBanner>
                <div className="mt-4">
                    <Button asChild>
                        <Link to={buildGuideUrl(guide)}>Back to guide</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-3xl px-4">
            <SectionPanel
                title="Edit guide"
                description={guide.title}
            >
                <GuideForm mode="edit" guide={guide} />
            </SectionPanel>
        </div>
    )
}
