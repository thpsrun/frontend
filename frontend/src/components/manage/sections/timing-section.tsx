import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { ChevronDown, ChevronRight } from "lucide-react"

import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { SectionPanel } from "@/components/profile/section-panel"
import { SaveButton } from "@/components/profile/save-button"
import { UnsavedChangesGuard } from "@/components/profile/unsaved-changes-guard"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useUpdateGame } from "@/hooks/game/useUpdateGame"
import { applyValidationErrors } from "@/lib/validation-errors"

import { GuideMarkdownEditor } from "@/components/guides/guide-markdown-editor"
import { TimingMethodsEditor } from "@/components/manage/timing-methods-editor"
import { normalizeRequired } from "@/lib/timing-inheritance"

import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

interface FormValues {
    rules: string
    defaulttime: TimingMethodType
    idefaulttime: TimingMethodType
    allowed_methods_fg: TimingMethodType[]
    allowed_methods_il: TimingMethodType[]
    required_methods_fg: TimingMethodType[]
    required_methods_il: TimingMethodType[]
}

const FIELD_NAMES: Array<keyof FormValues> = [
    "rules",
    "defaulttime",
    "idefaulttime",
    "allowed_methods_fg",
    "allowed_methods_il",
    "required_methods_fg",
    "required_methods_il",
]

export function TimingSection() {
    const { gameSlug } = useParams<{ gameSlug: string }>()
    const game = useGameDetail(gameSlug ?? "")
    const update = useUpdateGame()
    const [topError, setTopError] = useState<string | null>(null)
    const [rulesOpen, setRulesOpen] = useState(false)

    const form = useForm<FormValues>({
        mode: "onBlur",
        defaultValues: {
            rules: "",
            defaulttime: "rta",
            idefaulttime: "rta",
            allowed_methods_fg: [...ALL_TIMING_METHODS],
            allowed_methods_il: [...ALL_TIMING_METHODS],
            required_methods_fg: [...ALL_TIMING_METHODS],
            required_methods_il: [...ALL_TIMING_METHODS],
        },
    })

    // The form mounts before the game query resolves, so seed it once data arrives (and again on
    // refetch). Also doubles as the discard action for the unsaved-changes guard.
    const seedForm = useCallback(() => {
        if (!game.data) return
        form.reset({
            rules: game.data.rules ?? "",
            defaulttime: game.data.defaulttime ?? "rta",
            idefaulttime: game.data.idefaulttime ?? "rta",
            allowed_methods_fg: game.data.allowed_methods_fg
                ?? [...ALL_TIMING_METHODS],
            allowed_methods_il: game.data.allowed_methods_il
                ?? [...ALL_TIMING_METHODS],
            required_methods_fg: game.data.required_methods_fg
                ?? game.data.allowed_methods_fg
                ?? [...ALL_TIMING_METHODS],
            required_methods_il: game.data.required_methods_il
                ?? game.data.allowed_methods_il
                ?? [...ALL_TIMING_METHODS],
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
                    ...values,
                    required_methods_fg: normalizeRequired(
                        values.required_methods_fg,
                        values.allowed_methods_fg,
                        values.defaulttime,
                    ) ?? values.allowed_methods_fg,
                    required_methods_il: normalizeRequired(
                        values.required_methods_il,
                        values.allowed_methods_il,
                        values.idefaulttime,
                    ) ?? values.allowed_methods_il,
                },
            })
            toast.success("Timing Config Saved!")
            // Reset to the saved values so isDirty clears and the unsaved-changes guard releases.
            form.reset(values)
        } catch (e) {
            const msg = applyValidationErrors(e, form, FIELD_NAMES)
            if (msg) {
                setTopError(msg)
                toast.error(msg)
            }
            // Rethrow so the unsaved-changes guard knows the save failed and keeps navigation
            // blocked.
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
            <SectionPanel title="Game Rules">
                <AlertBanner variant="error">Game Not Found!</AlertBanner>
            </SectionPanel>
        )
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            {topError && (
                <AlertBanner variant="error">{topError}</AlertBanner>
            )}

            <SectionPanel
                title="Full Game"
                description={
                    `Default timing config for full game runs of ${game.data.name}.`
                }
            >
                <div className="flex flex-col gap-4">
                    <TimingMethodsEditor
                        id="timing-methods-fg"
                        value={{
                            allowed: form.watch("allowed_methods_fg"),
                            required: form.watch("required_methods_fg"),
                            primary: form.watch("defaulttime"),
                        }}
                        onChange={(next) => {
                            form.setValue(
                                "allowed_methods_fg",
                                next.allowed ?? [],
                                { shouldDirty: true },
                            )
                            form.setValue(
                                "required_methods_fg",
                                next.required ?? [],
                                { shouldDirty: true },
                            )
                            if (next.primary) {
                                form.setValue("defaulttime", next.primary, {
                                    shouldDirty: true,
                                })
                            }
                        }}
                        error={
                            form.formState.errors.allowed_methods_fg?.message
                            ?? form.formState.errors.required_methods_fg?.message
                            ?? form.formState.errors.defaulttime?.message
                        }
                    />
                    <div className="flex flex-col gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-fit gap-1 px-2"
                            onClick={() => setRulesOpen((o) => !o)}
                        >
                            {rulesOpen
                                ? <ChevronDown className="h-4 w-4" />
                                : <ChevronRight className="h-4 w-4" />}
                            Rules
                        </Button>
                        {rulesOpen && (
                            <Controller
                                control={form.control}
                                name="rules"
                                render={({ field }) => (
                                    <GuideMarkdownEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Game-Wide Rules (Markdown Supported)."
                                    />
                                )}
                            />
                        )}
                    </div>
                </div>
            </SectionPanel>

            <SectionPanel
                title="Individual Levels"
                description={
                    `Default timing config for individual level runs of ${game.data.name}.`
                }
            >
                <div className="flex flex-col gap-4">
                    <TimingMethodsEditor
                        id="timing-methods-il"
                        value={{
                            allowed: form.watch("allowed_methods_il"),
                            required: form.watch("required_methods_il"),
                            primary: form.watch("idefaulttime"),
                        }}
                        onChange={(next) => {
                            form.setValue(
                                "allowed_methods_il",
                                next.allowed ?? [],
                                { shouldDirty: true },
                            )
                            form.setValue(
                                "required_methods_il",
                                next.required ?? [],
                                { shouldDirty: true },
                            )
                            if (next.primary) {
                                form.setValue("idefaulttime", next.primary, {
                                    shouldDirty: true,
                                })
                            }
                        }}
                        error={
                            form.formState.errors.allowed_methods_il?.message
                            ?? form.formState.errors.required_methods_il?.message
                            ?? form.formState.errors.idefaulttime?.message
                        }
                    />
                </div>
            </SectionPanel>

            <SaveButton
                isPending={update.isPending}
                disabled={!form.formState.isDirty}
                className="self-end"
            />

            <UnsavedChangesGuard
                isDirty={form.formState.isDirty}
                onSave={handleSave}
                onDiscard={seedForm}
                isSaving={update.isPending}
            />
        </form>
    )
}
