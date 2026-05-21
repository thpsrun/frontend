import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams } from "react-router"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { toast } from "sonner"

import { AlertBanner } from "@/components/common/alert-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionDivider } from "@/components/ui/section-divider"
import { SectionPanel } from "@/components/profile/section-panel"
import { SaveButton } from "@/components/profile/save-button"
import { GuideMarkdownEditor } from "@/components/guides/guide-markdown-editor"
import { ChevronDown, ChevronRight } from "lucide-react"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useUpdateVariable } from "@/hooks/game/useUpdateVariable"
import { useUpdateVariableValue } from "@/hooks/game/useUpdateVariableValue"
import { applyValidationErrors } from "@/lib/validation-errors"
import {
    effectiveRequiredMethods,
    effectiveDefaultTime,
} from "@/lib/timing-inheritance"

import { RequiredMethodsField } from "@/components/manage/required-methods-field"
import { TimingMethodField } from "@/components/manage/timing-method-field"

import type {
    CategoryVariable,
    CategoryVariableValue,
    GameDetail,
} from "@/types/api"
import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

interface VariableFormValues {
    required_methods: TimingMethodType[] | null
    defaulttime: TimingMethodType | null
    values: Array<{
        value: string
        name: string
        required_methods: TimingMethodType[] | null
        defaulttime: TimingMethodType | null
        rules: string
    }>
}

const VARIABLE_FIELDS: Array<keyof VariableFormValues> = [
    "required_methods",
    "defaulttime",
    "values",
]

interface VariableEntry {
    variable: CategoryVariable
    parentRequired: TimingMethodType[]
    parentDefault: TimingMethodType | null
    categoryNames: string[]
}

function collectVariables(game: GameDetail): VariableEntry[] {
    const map = new Map<string, VariableEntry>()
    const fgRequired = game.required_methods_fg ?? [...ALL_TIMING_METHODS]
    const ilRequired = game.required_methods_il ?? [...ALL_TIMING_METHODS]
    const fgDefault = game.defaulttime ?? null
    const ilDefault = game.idefaulttime ?? null
    for (const cat of game.categories ?? []) {
        const isFg = cat.type === "per-game"
        const required = isFg ? fgRequired : ilRequired
        const def = isFg ? fgDefault : ilDefault
        for (const v of cat.variables ?? []) {
            const existing = map.get(v.id)
            if (!existing) {
                map.set(v.id, {
                    variable: v,
                    parentRequired: required,
                    parentDefault: def,
                    categoryNames: [cat.name],
                })
            } else if (!existing.categoryNames.includes(cat.name)) {
                existing.categoryNames.push(cat.name)
            }
        }
    }
    for (const lvl of game.levels ?? []) {
        for (const v of lvl.variables ?? []) {
            if (!map.has(v.id)) {
                map.set(v.id, {
                    variable: v,
                    parentRequired: ilRequired,
                    parentDefault: ilDefault,
                    categoryNames: [],
                })
            }
        }
    }
    return Array.from(map.values())
}

interface ValueRowProps {
    variableId: string
    idx: number
    name: string
    control: ReturnType<typeof useForm<VariableFormValues>>["control"]
    watch: ReturnType<typeof useForm<VariableFormValues>>["watch"]
    effectiveRequired: TimingMethodType[]
    inheritedValueDefault: TimingMethodType | null
}

function ValueRow({
    variableId,
    idx,
    name,
    control,
    watch,
    effectiveRequired,
    inheritedValueDefault,
}: ValueRowProps) {
    const [rulesOpen, setRulesOpen] = useState(false)
    const valueRequired = watch(`values.${idx}.required_methods`)
    const effectiveValueRequired = effectiveRequiredMethods(
        { required_methods: valueRequired },
        [{ required_methods: effectiveRequired }],
    )
    return (
        <div className="flex flex-col gap-3 rounded-md border border-border/40 p-3">
            <div className="text-sm font-medium text-foreground/80">
                {name}
            </div>
            <Controller
                control={control}
                name={`values.${idx}.required_methods` as const}
                render={({ field: f, fieldState }) => (
                    <RequiredMethodsField
                        id={`variable-${variableId}-value-${idx}-required`}
                        label="Required methods"
                        value={f.value}
                        onChange={f.onChange}
                        parentRequired={effectiveRequired}
                        allowInherit
                        error={fieldState.error?.message}
                    />
                )}
            />
            <Controller
                control={control}
                name={`values.${idx}.defaulttime` as const}
                rules={{
                    validate: (v) => {
                        if (v === null) return true
                        return effectiveValueRequired.includes(v)
                            || "Primary timing method must be in the required set."
                    },
                }}
                render={({ field: f, fieldState }) => (
                    <TimingMethodField
                        id={`variable-${variableId}-value-${idx}-default`}
                        label="Primary Timing Method"
                        value={f.value}
                        onChange={f.onChange}
                        requiredMethods={effectiveValueRequired}
                        allowInherit
                        inheritedValue={inheritedValueDefault}
                        error={fieldState.error?.message}
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
                        control={control}
                        name={`values.${idx}.rules` as const}
                        render={({ field: f }) => (
                            <GuideMarkdownEditor
                                value={f.value}
                                onChange={f.onChange}
                                placeholder={`Rules for ${name} (Markdown Supported).`}
                            />
                        )}
                    />
                )}
            </div>
        </div>
    )
}

interface VariableCardProps {
    entry: VariableEntry
    gameSlug: string
}

function VariableCard({ entry, gameSlug }: VariableCardProps) {
    const { variable, parentRequired, parentDefault, categoryNames } = entry
    const [topError, setTopError] = useState<string | null>(null)
    const updateVariable = useUpdateVariable(gameSlug)
    const updateValue = useUpdateVariableValue(gameSlug)

    const form = useForm<VariableFormValues>({
        mode: "onBlur",
        defaultValues: {
            required_methods: variable.required_methods ?? null,
            defaulttime: variable.defaulttime ?? null,
            values: variable.values.map((v: CategoryVariableValue) => ({
                value: v.value,
                name: v.name,
                required_methods: v.required_methods ?? null,
                defaulttime: v.defaulttime ?? null,
                rules: v.rules ?? "",
            })),
        },
    })

    const { fields } = useFieldArray({
        control: form.control,
        name: "values",
    })

    useEffect(() => {
        form.reset({
            required_methods: variable.required_methods ?? null,
            defaulttime: variable.defaulttime ?? null,
            values: variable.values.map((v) => ({
                value: v.value,
                name: v.name,
                required_methods: v.required_methods ?? null,
                defaulttime: v.defaulttime ?? null,
                rules: v.rules ?? "",
            })),
        })
    }, [variable, form])

    const watchedRequired = form.watch("required_methods")
    const watchedDefault = form.watch("defaulttime")
    const effectiveRequired = effectiveRequiredMethods(
        { required_methods: watchedRequired },
        [{ required_methods: parentRequired }],
    )
    const inheritedVariableDefault = effectiveDefaultTime(
        { defaulttime: null },
        [{ defaulttime: parentDefault }],
    )
    const inheritedValueDefault = effectiveDefaultTime(
        { defaulttime: null },
        [
            { defaulttime: watchedDefault },
            { defaulttime: parentDefault },
        ],
    )

    const handleSave = useCallback(async () => {
        const values = form.getValues()
        setTopError(null)
        try {
            await updateVariable.mutateAsync({
                variableId: variable.id,
                data: {
                    required_methods: values.required_methods,
                    defaulttime: values.defaulttime,
                },
            })
            const dirty = form.formState.dirtyFields.values
            const valueOps: Array<Promise<unknown>> = []
            if (Array.isArray(dirty)) {
                values.values.forEach((v, i) => {
                    const d = dirty[i]
                    if (!d) return
                    const data: {
                        required_methods?: TimingMethodType[] | null
                        defaulttime?: TimingMethodType | null
                        rules?: string | null
                    } = {}
                    if (d.required_methods) data.required_methods = v.required_methods
                    if (d.defaulttime) data.defaulttime = v.defaulttime
                    if (d.rules) data.rules = v.rules
                    if (Object.keys(data).length > 0) {
                        valueOps.push(updateValue.mutateAsync({
                            valueId: v.value,
                            data,
                        }))
                    }
                })
            }
            await Promise.all(valueOps)
            toast.success(`Saved ${variable.name}.`)
            form.reset(values)
        } catch (e) {
            const msg = applyValidationErrors(e, form, VARIABLE_FIELDS)
            if (msg) {
                setTopError(msg)
                toast.error(msg)
            }
        }
    }, [form, updateVariable, updateValue, variable.id, variable.name])

    const onSubmit = form.handleSubmit(handleSave)
    const isSaving = updateVariable.isPending || updateValue.isPending
    const valueLabel = variable.values.length === 1 ? "value" : "values"

    const description = (
        <div className="flex flex-col gap-2">
            {categoryNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {categoryNames.map((name) => (
                        <Badge key={name} variant="secondary">
                            {name}
                        </Badge>
                    ))}
                </div>
            )}
            <span>{`${variable.values.length} ${valueLabel}`}</span>
        </div>
    )

    return (
        <SectionPanel
            title={variable.name}
            description={description}
        >
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {topError && (
                    <AlertBanner variant="error">{topError}</AlertBanner>
                )}
                <Controller
                    control={form.control}
                    name="required_methods"
                    render={({ field, fieldState }) => (
                        <RequiredMethodsField
                            id={`variable-${variable.id}-required`}
                            label="Variable Required Methods"
                            value={field.value}
                            onChange={field.onChange}
                            parentRequired={parentRequired}
                            allowInherit
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="defaulttime"
                    rules={{
                        validate: (v) => {
                            if (v === null) return true
                            return effectiveRequired.includes(v)
                                || "Primary timing method must be in the required set!"
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <TimingMethodField
                            id={`variable-${variable.id}-default`}
                            label="Primary Timing Method"
                            value={field.value}
                            onChange={field.onChange}
                            requiredMethods={effectiveRequired}
                            allowInherit
                            inheritedValue={inheritedVariableDefault}
                            error={fieldState.error?.message}
                        />
                    )}
                />

                {fields.length > 0 && (
                    <>
                        <SectionDivider>
                            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                                Per-Value Overrides
                            </span>
                        </SectionDivider>
                        <div className="flex flex-col gap-6">
                            {fields.map((field, idx) => (
                                <ValueRow
                                    key={field.id}
                                    variableId={variable.id}
                                    idx={idx}
                                    name={field.name}
                                    control={form.control}
                                    watch={form.watch}
                                    effectiveRequired={effectiveRequired}
                                    inheritedValueDefault={inheritedValueDefault}
                                />
                            ))}
                        </div>
                    </>
                )}

                <SaveButton
                    isPending={isSaving}
                    disabled={!form.formState.isDirty}
                />
            </form>
        </SectionPanel>
    )
}

export function VariablesSection() {
    const { gameSlug } = useParams<{ gameSlug: string }>()
    const game = useGameDetail(gameSlug ?? "")

    const variables = useMemo(
        () => game.data ? collectVariables(game.data) : [],
        [game.data],
    )

    if (game.isLoading) return null
    if (!game.data) {
        return (
            <SectionPanel title="Variables">
                <AlertBanner variant="error">Game Not Found!</AlertBanner>
            </SectionPanel>
        )
    }

    if (variables.length === 0) {
        return (
            <SectionPanel
                title="Variables"
                description="Narrow timing methods per variable or per individual value."
            >
                <p className="text-sm text-muted-foreground">
                    No variables are defined for this game.
                </p>
            </SectionPanel>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {variables.map((entry) => (
                <VariableCard
                    key={entry.variable.id}
                    entry={entry}
                    gameSlug={game.data!.slug}
                />
            ))}
        </div>
    )
}
