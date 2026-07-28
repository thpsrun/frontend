import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams } from "react-router"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import type {
    Control,
    UseFormSetValue,
    UseFormWatch,
} from "react-hook-form"
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
import { cn } from "@/lib/utils"
import {
    effectiveAllowedMethods,
    effectiveRequiredMethods,
    effectiveDefaultTime,
    normalizeRequired,
} from "@/lib/timing-inheritance"

import {
    TimingMethodsEditor,
    compactTimingSummary,
} from "@/components/manage/timing-methods-editor"

import type {
    CategoryVariable,
    CategoryVariableValue,
    GameDetail,
} from "@/types/api"
import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

interface VariableFormValues {
    allowed_methods: TimingMethodType[] | null
    required_methods: TimingMethodType[] | null
    defaulttime: TimingMethodType | null
    values: Array<{
        value: string
        name: string
        allowed_methods: TimingMethodType[] | null
        required_methods: TimingMethodType[] | null
        defaulttime: TimingMethodType | null
        rules: string
    }>
}

const VARIABLE_FIELDS: Array<keyof VariableFormValues> = [
    "allowed_methods",
    "required_methods",
    "defaulttime",
    "values",
]

interface VariableEntry {
    variable: CategoryVariable
    parentAllowed: TimingMethodType[]
    parentRequired: TimingMethodType[]
    parentDefault: TimingMethodType | null
    scopeLabel: "Full Game" | "Individual Levels"
    alsoIn: string[]
}

interface VariableGroup {
    key: string
    heading: string
    subheading: string
    entries: VariableEntry[]
}

// Group non-archived variables under their first non-archived category (API
// order), then a trailing group for level-scoped variables.
function collectVariableGroups(game: GameDetail): VariableGroup[] {
    const fgAllowed = game.allowed_methods_fg ?? [...ALL_TIMING_METHODS]
    const ilAllowed = game.allowed_methods_il ?? [...ALL_TIMING_METHODS]
    const fgRequired = game.required_methods_fg ?? fgAllowed
    const ilRequired = game.required_methods_il ?? ilAllowed
    const fgDefault = game.defaulttime ?? null
    const ilDefault = game.idefaulttime ?? null

    const seen = new Map<string, VariableEntry>()
    const groups: VariableGroup[] = []

    for (const cat of game.categories ?? []) {
        if (cat.archive) continue
        const isFg = cat.type === "per-game"
        const entries: VariableEntry[] = []
        for (const v of cat.variables ?? []) {
            if (v.archive) continue
            const existing = seen.get(v.id)
            if (existing) {
                if (!existing.alsoIn.includes(cat.name)) {
                    existing.alsoIn.push(cat.name)
                }
                continue
            }
            const entry: VariableEntry = {
                variable: v,
                parentAllowed: isFg ? fgAllowed : ilAllowed,
                parentRequired: isFg ? fgRequired : ilRequired,
                parentDefault: isFg ? fgDefault : ilDefault,
                scopeLabel: isFg ? "Full Game" : "Individual Levels",
                alsoIn: [],
            }
            seen.set(v.id, entry)
            entries.push(entry)
        }
        if (entries.length > 0) {
            groups.push({
                key: `category-${cat.id}`,
                heading: cat.name,
                subheading: isFg
                    ? "Full Game category"
                    : "Individual Levels category",
                entries,
            })
        }
    }

    const levelEntries: VariableEntry[] = []
    for (const lvl of game.levels ?? []) {
        for (const v of lvl.variables ?? []) {
            if (v.archive || seen.has(v.id)) continue
            const entry: VariableEntry = {
                variable: v,
                parentAllowed: ilAllowed,
                parentRequired: ilRequired,
                parentDefault: ilDefault,
                scopeLabel: "Individual Levels",
                alsoIn: [],
            }
            seen.set(v.id, entry)
            levelEntries.push(entry)
        }
    }
    if (levelEntries.length > 0) {
        groups.push({
            key: "levels",
            heading: "Individual Levels",
            subheading: "Level-scoped variables",
            entries: levelEntries,
        })
    }
    return groups
}

interface ValueRowProps {
    variableId: string
    variableName: string
    idx: number
    name: string
    control: Control<VariableFormValues>
    watch: UseFormWatch<VariableFormValues>
    setValue: UseFormSetValue<VariableFormValues>
    variableEffectiveAllowed: TimingMethodType[]
    variableEffectiveRequired: TimingMethodType[]
    inheritedValueDefault: TimingMethodType | null
}

// One collapsible per-value override row. Collapsed it shows the value's
// status and effective methods; expanded it hosts the editor (inheriting from
// the variable) and the rules editor.
function ValueRow({
    variableId,
    variableName,
    idx,
    name,
    control,
    watch,
    setValue,
    variableEffectiveAllowed,
    variableEffectiveRequired,
    inheritedValueDefault,
}: ValueRowProps) {
    const [open, setOpen] = useState(false)
    const [rulesOpen, setRulesOpen] = useState(false)
    const valueAllowed = watch(`values.${idx}.allowed_methods`)
    const valueRequired = watch(`values.${idx}.required_methods`)
    const valueDefault = watch(`values.${idx}.defaulttime`)
    const customized = valueAllowed != null
        || valueRequired != null
        || valueDefault != null

    // Effective sets drive the collapsed summary line.
    const effAllowed = effectiveAllowedMethods(
        { allowed_methods: valueAllowed },
        [{ allowed_methods: variableEffectiveAllowed }],
    )
    const effPrimary = valueDefault ?? inheritedValueDefault
    const effRequired = effectiveRequiredMethods(
        { required_methods: valueRequired },
        [{ required_methods: variableEffectiveRequired }],
        effAllowed,
        effPrimary,
    )
    const optional = effAllowed.filter((m) => !effRequired.includes(m))
    // What "inherit" resolves to: the variable's required set in the
    // variable's window.
    const inheritedValueRequired = effectiveRequiredMethods(
        { required_methods: null },
        [{ required_methods: variableEffectiveRequired }],
        variableEffectiveAllowed,
        inheritedValueDefault,
    )

    return (
        <div className="rounded-md border border-border/40">
            <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
            >
                {open
                    ? <ChevronDown className="h-4 w-4 shrink-0" />
                    : <ChevronRight className="h-4 w-4 shrink-0" />}
                <span className="font-medium">{name}</span>
                <span
                    className={cn(
                        "text-xs",
                        customized ? "text-amber-400" : "text-muted-foreground",
                    )}
                >
                    {customized ? "Customized" : "Inheriting"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    {compactTimingSummary(effRequired, effPrimary, optional)}
                </span>
            </button>
            {open && (
                <div className="flex flex-col gap-3 border-t border-border/40 p-3">
                    <TimingMethodsEditor
                        id={`variable-${variableId}-value-${idx}-timing`}
                        value={{
                            allowed: valueAllowed,
                            required: valueRequired,
                            primary: valueDefault,
                        }}
                        onChange={(next) => {
                            setValue(
                                `values.${idx}.allowed_methods`,
                                next.allowed,
                                { shouldDirty: true },
                            )
                            setValue(
                                `values.${idx}.required_methods`,
                                next.required,
                                { shouldDirty: true },
                            )
                            setValue(
                                `values.${idx}.defaulttime`,
                                next.primary,
                                { shouldDirty: true },
                            )
                        }}
                        parentAllowed={variableEffectiveAllowed}
                        inheritedRequired={inheritedValueRequired}
                        inheritedPrimary={inheritedValueDefault}
                        allowInherit
                        parentLabel={variableName}
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
            )}
        </div>
    )
}

interface VariableCardProps {
    entry: VariableEntry
    gameSlug: string
}

function VariableCard({ entry, gameSlug }: VariableCardProps) {
    const {
        variable, parentAllowed, parentRequired,
        parentDefault, scopeLabel, alsoIn,
    } = entry
    const activeValues = useMemo(
        () => variable.values.filter((v) => !v.archive),
        [variable],
    )
    const [topError, setTopError] = useState<string | null>(null)
    const updateVariable = useUpdateVariable(gameSlug)
    const updateValue = useUpdateVariableValue(gameSlug)

    const form = useForm<VariableFormValues>({
        mode: "onBlur",
        defaultValues: {
            allowed_methods: variable.allowed_methods ?? null,
            required_methods: variable.required_methods ?? null,
            defaulttime: variable.defaulttime ?? null,
            values: activeValues.map((v: CategoryVariableValue) => ({
                value: v.value,
                name: v.name,
                allowed_methods: v.allowed_methods ?? null,
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

    // Re-seed when the server values change (saving invalidates the game
    // query, which refetches every variable).
    useEffect(() => {
        form.reset({
            allowed_methods: variable.allowed_methods ?? null,
            required_methods: variable.required_methods ?? null,
            defaulttime: variable.defaulttime ?? null,
            values: activeValues.map((v) => ({
                value: v.value,
                name: v.name,
                allowed_methods: v.allowed_methods ?? null,
                required_methods: v.required_methods ?? null,
                defaulttime: v.defaulttime ?? null,
                rules: v.rules ?? "",
            })),
        })
    }, [variable, activeValues, form])

    const watchedAllowed = form.watch("allowed_methods")
    const watchedRequired = form.watch("required_methods")
    const watchedDefault = form.watch("defaulttime")

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
    // The variable's effective config is the parent context for value rows.
    const variableEffectiveAllowed = effectiveAllowedMethods(
        { allowed_methods: watchedAllowed },
        [{ allowed_methods: parentAllowed }],
    )
    const variableEffectivePrimary = watchedDefault ?? inheritedVariableDefault
    const variableEffectiveRequired = effectiveRequiredMethods(
        { required_methods: watchedRequired },
        [{ required_methods: parentRequired }],
        variableEffectiveAllowed,
        variableEffectivePrimary,
    )
    // What "inherit" resolves to for this variable: the game-scope required
    // set in the game-scope window.
    const inheritedVariableRequired = effectiveRequiredMethods(
        { required_methods: null },
        [{ required_methods: parentRequired }],
        parentAllowed,
        inheritedVariableDefault,
    )

    const handleSave = useCallback(async () => {
        const values = form.getValues()
        setTopError(null)
        // Resolve the variable's effective window/primary so its required set
        // (and each value's, relative to it) can be clamped before sending. A
        // null required stays null (inherit).
        const varEffAllowed = effectiveAllowedMethods(
            { allowed_methods: values.allowed_methods },
            [{ allowed_methods: parentAllowed }],
        )
        const varEffPrimary = values.defaulttime ?? parentDefault
        try {
            await updateVariable.mutateAsync({
                variableId: variable.id,
                data: {
                    allowed_methods: values.allowed_methods,
                    required_methods: normalizeRequired(
                        values.required_methods, varEffAllowed, varEffPrimary,
                    ),
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
                        allowed_methods?: TimingMethodType[] | null
                        required_methods?: TimingMethodType[] | null
                        defaulttime?: TimingMethodType | null
                        rules?: string | null
                    } = {}
                    if (d.allowed_methods) data.allowed_methods = v.allowed_methods
                    if (d.required_methods) {
                        const valEffAllowed = effectiveAllowedMethods(
                            { allowed_methods: v.allowed_methods },
                            [{ allowed_methods: varEffAllowed }],
                        )
                        data.required_methods = normalizeRequired(
                            v.required_methods,
                            valEffAllowed,
                            v.defaulttime ?? varEffPrimary,
                        )
                    }
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
    }, [
        form, updateVariable, updateValue, variable.id, variable.name,
        parentAllowed, parentDefault,
    ])

    const onSubmit = form.handleSubmit(handleSave)
    const isSaving = updateVariable.isPending || updateValue.isPending
    const valueLabel = activeValues.length === 1 ? "value" : "values"

    const description = (
        <div className="flex flex-col gap-2">
            {alsoIn.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span>Also in:</span>
                    {alsoIn.map((name) => (
                        <Badge key={name} variant="secondary">
                            {name}
                        </Badge>
                    ))}
                </div>
            )}
            <span>{`${activeValues.length} ${valueLabel}`}</span>
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
                <TimingMethodsEditor
                    id={`variable-${variable.id}-timing`}
                    value={{
                        allowed: watchedAllowed,
                        required: watchedRequired,
                        primary: watchedDefault,
                    }}
                    onChange={(next) => {
                        form.setValue("allowed_methods", next.allowed, {
                            shouldDirty: true,
                        })
                        form.setValue("required_methods", next.required, {
                            shouldDirty: true,
                        })
                        form.setValue("defaulttime", next.primary, {
                            shouldDirty: true,
                        })
                    }}
                    parentAllowed={parentAllowed}
                    inheritedRequired={inheritedVariableRequired}
                    inheritedPrimary={inheritedVariableDefault}
                    allowInherit
                    parentLabel={scopeLabel}
                    error={
                        form.formState.errors.allowed_methods?.message
                        ?? form.formState.errors.required_methods?.message
                        ?? form.formState.errors.defaulttime?.message
                    }
                />

                {fields.length > 0 && (
                    <>
                        <SectionDivider>
                            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                                Per-Value Overrides
                            </span>
                        </SectionDivider>
                        <div className="flex flex-col gap-3">
                            {fields.map((field, idx) => (
                                <ValueRow
                                    key={field.id}
                                    variableId={variable.id}
                                    variableName={variable.name}
                                    idx={idx}
                                    name={field.name}
                                    control={form.control}
                                    watch={form.watch}
                                    setValue={form.setValue}
                                    variableEffectiveAllowed={variableEffectiveAllowed}
                                    variableEffectiveRequired={variableEffectiveRequired}
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

    const groups = useMemo(
        () => game.data ? collectVariableGroups(game.data) : [],
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

    if (groups.length === 0) {
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
        <div className="flex flex-col gap-8">
            {groups.map((group) => (
                <section key={group.key} className="flex flex-col gap-4">
                    <div className="border-b border-border/40 pb-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                            {group.heading}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                            {group.subheading}
                        </span>
                    </div>
                    {group.entries.map((entry) => (
                        <VariableCard
                            key={entry.variable.id}
                            entry={entry}
                            gameSlug={game.data!.slug}
                        />
                    ))}
                </section>
            ))}
        </div>
    )
}
