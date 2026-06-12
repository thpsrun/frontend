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
import { TimingMethodField } from "@/components/manage/timing-method-field"
import { RequiredMethodsField } from "@/components/manage/required-methods-field"

import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

interface FormValues {
    rules: string
    defaulttime: TimingMethodType
    idefaulttime: TimingMethodType
    required_methods_fg: TimingMethodType[]
    required_methods_il: TimingMethodType[]
}

const FIELD_NAMES: Array<keyof FormValues> = [
    "rules",
    "defaulttime",
    "idefaulttime",
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
            required_methods_fg: game.data.required_methods_fg
                ?? [...ALL_TIMING_METHODS],
            required_methods_il: game.data.required_methods_il
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
            await update.mutateAsync({ slug: gameSlug, data: values })
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

    const fg = form.watch("required_methods_fg")
    const il = form.watch("required_methods_il")

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
                    <Controller
                        control={form.control}
                        name="required_methods_fg"
                        render={({ field, fieldState }) => (
                            // The game is the root of the inheritance chain, so the field's null
                            // (inherit) has no parent to defer to; onChange stores it as an empty
                            // list instead.
                            <RequiredMethodsField
                                id="required_methods_fg"
                                label="Required Methods"
                                value={field.value}
                                onChange={(v) => field.onChange(v ?? [])}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="defaulttime"
                        rules={{
                            validate: (v) =>
                                fg.includes(v)
                                || "Primary timing method must be one of the required methods!",
                        }}
                        render={({ field, fieldState }) => (
                            // With nothing required, requiredMethods falls back to the field's
                            // full default list so the select never renders empty.
                            <TimingMethodField
                                id="defaulttime"
                                label="Primary timing method"
                                value={field.value}
                                onChange={(v) => v && field.onChange(v)}
                                requiredMethods={fg.length > 0 ? fg : undefined}
                                error={fieldState.error?.message}
                                helpText="Must be one of the required methods above!"
                            />
                        )}
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
                    <Controller
                        control={form.control}
                        name="required_methods_il"
                        render={({ field, fieldState }) => (
                            <RequiredMethodsField
                                id="required_methods_il"
                                label="Required Methods"
                                value={field.value}
                                onChange={(v) => field.onChange(v ?? [])}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="idefaulttime"
                        rules={{
                            validate: (v) =>
                                il.includes(v)
                                || "Primary timing method must be one of the required methods!",
                        }}
                        render={({ field, fieldState }) => (
                            <TimingMethodField
                                id="idefaulttime"
                                label="Primary Timing Method"
                                value={field.value}
                                onChange={(v) => v && field.onChange(v)}
                                requiredMethods={il.length > 0 ? il : undefined}
                                error={fieldState.error?.message}
                                helpText="Must be one of the required methods above!"
                            />
                        )}
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
