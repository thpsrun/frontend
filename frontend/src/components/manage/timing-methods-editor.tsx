import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import type { TimingMethodType } from "@/types/shared"
import { TIMING_METHOD_LABELS, ALL_TIMING_METHODS } from "@/types/shared"

// The three stored timing fields edited as one unit. All being null means inherit.
export interface TimingMethodsValue {
    allowed: TimingMethodType[] | null
    required: TimingMethodType[] | null
    primary: TimingMethodType | null
}

type MethodState = "off" | "optional" | "required"

interface TimingMethodsEditorProps {
    id?: string
    label?: string
    value: TimingMethodsValue
    onChange: (next: TimingMethodsValue) => void
    parentAllowed?: ReadonlyArray<TimingMethodType>
    inheritedRequired?: ReadonlyArray<TimingMethodType>
    inheritedPrimary?: TimingMethodType | null
    allowInherit?: boolean
    parentLabel?: string
    disabled?: boolean
    error?: string
}

function joinLabels(methods: ReadonlyArray<TimingMethodType>): string {
    const labels = methods.map((m) => TIMING_METHOD_LABELS[m])
    if (labels.length <= 1) return labels[0] ?? ""
    return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`
}

export function compactTimingSummary(
    required: ReadonlyArray<TimingMethodType>,
    primary: TimingMethodType | null,
    optional: ReadonlyArray<TimingMethodType>,
): string {
    const req = required
        .map((m) => m === primary
            ? `${TIMING_METHOD_LABELS[m]} ★`
            : TIMING_METHOD_LABELS[m])
        .join(" + ")
    const parts: string[] = []
    if (req) parts.push(`${req} required`)
    if (optional.length > 0) {
        parts.push(
            `${optional.map((m) => TIMING_METHOD_LABELS[m]).join(" + ")} optional`,
        )
    }
    return parts.join(" · ")
}

function summaryText(
    required: ReadonlyArray<TimingMethodType>,
    optional: ReadonlyArray<TimingMethodType>,
    allowed: ReadonlyArray<TimingMethodType>,
): string {
    const parts: string[] = []
    if (required.length > 0) {
        parts.push(`Runs must include ${joinLabels(required)}.`)
    }
    if (optional.length > 0) {
        const verb = optional.length === 1 ? "is" : "are"
        parts.push(`${joinLabels(optional)} ${verb} accepted but not required.`)
    }
    const notAllowed = ALL_TIMING_METHODS.filter((m) => !allowed.includes(m))
    if (notAllowed.length > 0) {
        const verb = notAllowed.length === 1 ? "is" : "are"
        parts.push(`${joinLabels(notAllowed)} ${verb} not accepted.`)
    }
    return parts.join(" ")
}

// Single editor for a tier's timing config.
export function TimingMethodsEditor({
    id,
    label = "Timing methods",
    value,
    onChange,
    parentAllowed = ALL_TIMING_METHODS,
    inheritedRequired,
    inheritedPrimary = null,
    allowInherit = false,
    parentLabel = "Parent",
    disabled = false,
    error,
}: TimingMethodsEditorProps) {
    const inherits = allowInherit
        && value.allowed == null
        && value.required == null
        && value.primary == null

    // Resolve display state: concrete fields win, nulls fall back to inherit, partial is Customized.
    const effAllowed = value.allowed ?? [...parentAllowed]
    const baseRequired = value.required
        ?? (inheritedRequired ? [...inheritedRequired] : [...effAllowed])
    const effPrimary = value.primary ?? inheritedPrimary
    let effRequired = baseRequired.filter((m) => effAllowed.includes(m))
    if (effPrimary && effAllowed.includes(effPrimary)
        && !effRequired.includes(effPrimary)) {
        effRequired = [...effRequired, effPrimary]
    }
    effRequired = ALL_TIMING_METHODS.filter((m) => effRequired.includes(m))
    const optional = effAllowed.filter((m) => !effRequired.includes(m))

    const stateFor = (m: TimingMethodType): MethodState => {
        if (!effAllowed.includes(m)) return "off"
        return effRequired.includes(m) ? "required" : "optional"
    }

    const materialize = (): TimingMethodsValue => ({
        allowed: ALL_TIMING_METHODS.filter((m) => effAllowed.includes(m)),
        required: [...effRequired],
        primary: effPrimary,
    })

    const setState = (method: TimingMethodType, state: MethodState) => {
        const states = new Map(ALL_TIMING_METHODS.map((m) => [m, stateFor(m)]))
        states.set(method, state)
        const allowed = ALL_TIMING_METHODS.filter(
            (m) => states.get(m) !== "off" && parentAllowed.includes(m),
        )
        // A tier must keep at least one allowed method!!
        if (allowed.length === 0) return
        const required = allowed.filter((m) => states.get(m) === "required")
        let primary = effPrimary
        if (primary && !allowed.includes(primary)) primary = null
        if (primary && !required.includes(primary)) required.push(primary)
        onChange({
            allowed,
            required: ALL_TIMING_METHODS.filter((m) => required.includes(m)),
            primary,
        })
    }

    const setPrimary = (method: TimingMethodType) => {
        const base = materialize()
        const required = base.required ?? []
        if (!required.includes(method)) required.push(method)
        onChange({
            allowed: base.allowed,
            required: ALL_TIMING_METHODS.filter((m) => required.includes(m)),
            primary: method,
        })
    }

    return (
        <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor={id}>{label}</Label>
                {allowInherit && (
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        size="sm"
                        value={inherits ? "inherit" : "custom"}
                        disabled={disabled}
                        onValueChange={(v) => {
                            if (v === "inherit") {
                                onChange({
                                    allowed: null,
                                    required: null,
                                    primary: null,
                                })
                            } else if (v === "custom") {
                                onChange(materialize())
                            }
                        }}
                        aria-label="Inheritance"
                    >
                        <ToggleGroupItem value="inherit" className="px-3">
                            Inherit
                        </ToggleGroupItem>
                        <ToggleGroupItem value="custom" className="px-3">
                            Customize
                        </ToggleGroupItem>
                    </ToggleGroup>
                )}
            </div>
            <div
                id={id}
                className={cn(
                    "rounded-md border border-border/40 px-3",
                    inherits && "opacity-60",
                )}
            >
                {ALL_TIMING_METHODS.map((method) => {
                    const excluded = !parentAllowed.includes(method)
                    const state = stateFor(method)
                    const isPrimary = state === "required"
                        && method === effPrimary
                    const locked = disabled || inherits || excluded
                    return (
                        <div
                            key={method}
                            className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 last:border-b-0"
                        >
                            <span
                                className={cn(
                                    "flex items-center gap-1 text-sm",
                                    excluded && "text-muted-foreground",
                                )}
                            >
                                {TIMING_METHOD_LABELS[method]}
                                {excluded && (
                                    <span className="text-xs text-muted-foreground">
                                        (excluded by {parentLabel})
                                    </span>
                                )}
                                {state === "required" && !excluded && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        disabled={locked}
                                        onClick={() => setPrimary(method)}
                                        title={isPrimary
                                            ? "Primary timing method"
                                            : "Make primary"}
                                        aria-label={isPrimary
                                            ? `${TIMING_METHOD_LABELS[method]} is the primary method`
                                            : `Make ${TIMING_METHOD_LABELS[method]} the primary method`}
                                    >
                                        <Star
                                            className={cn(
                                                "h-3.5 w-3.5",
                                                isPrimary
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-muted-foreground",
                                            )}
                                        />
                                    </Button>
                                )}
                            </span>
                            <ToggleGroup
                                type="single"
                                variant="outline"
                                size="sm"
                                value={state}
                                disabled={locked || isPrimary}
                                onValueChange={(v) => {
                                    if (v) setState(method, v as MethodState)
                                }}
                                aria-label={`${TIMING_METHOD_LABELS[method]} state`}
                                title={isPrimary && !locked
                                    ? "Move the primary star to another required method first"
                                    : undefined}
                            >
                                <ToggleGroupItem value="off" className="px-3">
                                    Not allowed
                                </ToggleGroupItem>
                                <ToggleGroupItem value="optional" className="px-3">
                                    Optional
                                </ToggleGroupItem>
                                <ToggleGroupItem value="required" className="px-3">
                                    Required
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    )
                })}
            </div>
            <p className="text-xs text-muted-foreground">
                {inherits && (
                    <span className="font-medium text-foreground/70">
                        {`Following ${parentLabel}: `}
                    </span>
                )}
                {summaryText(effRequired, optional, effAllowed)}
            </p>
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    )
}
