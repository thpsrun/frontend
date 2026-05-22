import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"

import { AlertBanner } from "@/components/common/alert-banner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SectionPanel } from "@/components/profile/section-panel"
import { SaveButton } from "@/components/profile/save-button"
import { UnsavedChangesGuard } from "@/components/profile/unsaved-changes-guard"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useUpdateGame } from "@/hooks/game/useUpdateGame"
import { applyValidationErrors } from "@/lib/validation-errors"
import { BACKEND_URL } from "@/constants"

interface FormValues {
    release: string
}

const FIELD_NAMES: Array<keyof FormValues> = [
    "release",
]

export function GeneralSection() {
    const { gameSlug } = useParams<{ gameSlug: string }>()
    const game = useGameDetail(gameSlug ?? "")
    const update = useUpdateGame()
    const [topError, setTopError] = useState<string | null>(null)

    const form = useForm<FormValues>({
        mode: "onBlur",
        defaultValues: {
            release: "",
        },
    })

    const seedForm = useCallback(() => {
        if (!game.data) return
        form.reset({
            release: game.data.release ?? "",
        })
    }, [game.data, form])

    useEffect(() => {
        seedForm()
    }, [seedForm])

    const handleSave = useCallback(async () => {
        if (!gameSlug) return
        const values = form.getValues()
        setTopError(null)
        try {
            await update.mutateAsync({
                slug: gameSlug,
                data: {
                    release: values.release || null,
                },
            })
            toast.success("General settings saved.")
            form.reset(values)
        } catch (e) {
            const msg = applyValidationErrors(e, form, FIELD_NAMES)
            if (msg) {
                setTopError(msg)
                toast.error(msg)
            }
            throw e
        }
    }, [gameSlug, form, update])

    const onSubmit = form.handleSubmit(async () => {
        try {
            await handleSave()
        } catch {
            // handleSave already surfaces errors via toast/topError.
        }
    })

    if (game.isLoading) return null
    if (!game.data) {
        return (
            <SectionPanel title="General">
                <AlertBanner variant="error">Game Not Found!</AlertBanner>
            </SectionPanel>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <SectionPanel
                title="General"
                description={`Metadata for ${game.data.name}.`}
            >
                <form onSubmit={onSubmit} className="flex flex-col gap-6">
                    {topError && (
                        <AlertBanner variant="error">{topError}</AlertBanner>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label>Boxart</Label>
                        <div className="flex items-start gap-4">
                            {game.data.boxart
                                ? (
                                    <img
                                        src={`${BACKEND_URL}${game.data.boxart}`}
                                        alt={`${game.data.name} boxart`}
                                        className="h-32 w-auto rounded-md border border-border bg-muted/20 object-contain"
                                    />
                                )
                                : (
                                    <div className="flex h-32 w-24 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                                        No Boxart... Hmm...
                                    </div>
                                )}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase tracking-wider text-foreground/60">
                                    URL
                                </span>
                                <code className="block max-w-160 break-all rounded bg-muted/40 px-2 py-1 font-mono text-xs">
                                    {game.data.boxart || "(none)"}
                                </code>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="game-slug">Slug</Label>
                        <Input
                            id="game-slug"
                            value={game.data.slug}
                            disabled
                            readOnly
                        />
                    </div>

                    <Controller
                        control={form.control}
                        name="release"
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="game-release">Release Date</Label>
                                <Input
                                    id="game-release"
                                    type="date"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="w-fit"
                                />
                                {fieldState.error?.message && (
                                    <p className="text-xs text-destructive">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    <div className="flex flex-col gap-2">
                        <Label>Platforms</Label>
                        {game.data.platforms && game.data.platforms.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {game.data.platforms.map((p) => (
                                    <Badge key={p.id} variant="secondary">
                                        {p.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                No platforms assigned.
                            </p>
                        )}
                    </div>

                    <SaveButton isPending={update.isPending} />
                </form>
            </SectionPanel>

            <UnsavedChangesGuard
                isDirty={form.formState.isDirty}
                onSave={handleSave}
                onDiscard={seedForm}
                isSaving={update.isPending}
            />
        </div>
    )
}
