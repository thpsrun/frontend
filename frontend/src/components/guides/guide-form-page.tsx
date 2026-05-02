import { Link, useParams } from "react-router"
import { Panel } from "@/components/ui/panel"
import { Button } from "@/components/ui/button"
import { useGuide } from "@/hooks/guides/useGuide"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { ApiError } from "@/lib/api-client"
import { GuideForm } from "./guide-form"

interface Props {
    mode: "create" | "edit"
}

export function GuideFormPage({ mode }: Props) {
    const { slug } = useParams<{ slug: string }>()
    const { player } = useCurrentPlayer()

    if (mode === "create") {
        return (
            <div className="container mx-auto max-w-3xl px-4 py-6">
                <h1 className="mb-4 text-2xl font-semibold">New guide</h1>
                <GuideForm mode="create" />
            </div>
        )
    }

    return (
        <EditPage
            slug={slug ?? ""}
            isSuperuser={!!player?.player.is_superuser}
            moderatedSlugs={(player?.moderation?.moderated_games ?? []).map((g) => g.slug)}
        />
    )
}

function EditPage({
    slug,
    isSuperuser,
    moderatedSlugs,
}: {
    slug: string
    isSuperuser: boolean
    moderatedSlugs: string[]
}) {
    const { data: guide, isLoading, isError, error } = useGuide(slug)

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-3xl px-4 py-10">
                <div className="space-y-3">
                    <div className="h-8 w-2/3 animate-pulse rounded bg-muted/40" />
                    <div className="h-32 w-full animate-pulse rounded bg-muted/40" />
                </div>
            </div>
        )
    }

    if (isError || !guide) {
        const status = error instanceof ApiError ? error.status : null
        return (
            <div className="container mx-auto max-w-3xl px-4 py-10">
                <Panel className="p-10 text-center">
                    <h1 className="text-xl font-semibold">
                        {status === 403 ? "You can't edit this guide" : "Guide not found"}
                    </h1>
                    <Button asChild className="mt-4">
                        <Link to="/guides">Back to guides</Link>
                    </Button>
                </Panel>
            </div>
        )
    }

    const canEdit = typeof guide.can_edit === "boolean"
        ? guide.can_edit
        : isSuperuser || (!!guide.game?.slug && moderatedSlugs.includes(guide.game.slug))

    if (!canEdit) {
        return (
            <div className="container mx-auto max-w-3xl px-4 py-10">
                <Panel className="p-10 text-center">
                    <h1 className="text-xl font-semibold">You can't edit this guide</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Only the author, moderators of the game, or admins can make changes.
                    </p>
                    <Button asChild className="mt-4">
                        <Link to={`/guides/${guide.slug}`}>Back to guide</Link>
                    </Button>
                </Panel>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-6">
            <h1 className="mb-4 text-2xl font-semibold">Edit guide</h1>
            <GuideForm mode="edit" guide={guide} />
        </div>
    )
}
