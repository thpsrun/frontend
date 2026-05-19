import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"

import { AlertBanner } from "@/components/ui/alert-banner"
import { SectionDivider } from "@/components/ui/section-divider"
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
        <div className="flex flex-col gap-6">
            <SectionPanel
                title="Game Rules"
                description={
                    `Game-wide rules and timing config for ${game.data.name}.`
                }
            >
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    {topError && (
                        <AlertBanner variant="error">{topError}</AlertBanner>
                    )}

                    <Controller
                        control={form.control}
                        name="rules"
                        render={({ field }) => (
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="game-rules"
                                    className="text-sm font-semibold uppercase tracking-wider text-foreground/80"
                                >
                                    Rules
                                </label>
                                <GuideMarkdownEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Game-Wide Rules (Markdown Supported)."
                                />
                            </div>
                        )}
                    />

                    <SectionDivider />

                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                            Full Game
                        </h3>
                        <Controller
                            control={form.control}
                            name="required_methods_fg"
                            render={({ field, fieldState }) => (
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
                    </div>

                    <SectionDivider />

                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                            Individual Levels
                        </h3>
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
