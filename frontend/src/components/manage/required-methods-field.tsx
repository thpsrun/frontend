import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { TimingMethodType } from "@/types/shared"
import { TIMING_METHOD_LABELS, ALL_TIMING_METHODS } from "@/types/shared"

interface RequiredMethodsFieldProps {
    id?: string
    label: string
    value: TimingMethodType[] | null | undefined
    onChange: (next: TimingMethodType[] | null) => void
    parentRequired?: ReadonlyArray<TimingMethodType>
    allowInherit?: boolean
    error?: string
    disabled?: boolean
    helpText?: string
}

export function RequiredMethodsField({
    id,
    label,
    value,
    onChange,
    parentRequired = ALL_TIMING_METHODS,
    allowInherit = false,
    error,
    disabled,
    helpText,
}: RequiredMethodsFieldProps) {
    const inherits = value == null
    const effective: TimingMethodType[] = inherits
        ? [...parentRequired]
        : value

    const toggle = (method: TimingMethodType) => {
        if (value == null) {
            const next = parentRequired.filter((m) => m !== method)
            onChange(next.length > 0 ? next : null)
            return
        }
        if (value.includes(method)) {
            const next = value.filter((m) => m !== method)
            onChange(next.length > 0 ? next : null)
        } else {
            onChange([...value, method])
        }
    }

    const inheritHint = parentRequired
        .map((m) => TIMING_METHOD_LABELS[m])
        .join(", ")

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div
                id={id}
                className="space-y-2 rounded-md border border-border/40 p-3"
            >
                {allowInherit && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                            checked={inherits}
                            onCheckedChange={(checked) => {
                                onChange(checked ? null : [...parentRequired])
                            }}
                            disabled={disabled}
                        />
                        <span>
                            Inherit from Parent
                            <span className="text-muted-foreground ml-1">
                                ({inheritHint})
                            </span>
                        </span>
                    </label>
                )}
                <div className="space-y-1 pl-1">
                    {ALL_TIMING_METHODS.map((method) => {
                        const isInParent = parentRequired.includes(method)
                        const checked = effective.includes(method)
                        return (
                            <label
                                key={method}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => toggle(method)}
                                    disabled={disabled || !isInParent || inherits}
                                />
                                <span>
                                    {TIMING_METHOD_LABELS[method]}
                                    {!isInParent && (
                                        <span className="text-muted-foreground ml-1">
                                            (excluded by parent)
                                        </span>
                                    )}
                                </span>
                            </label>
                        )
                    })}
                </div>
            </div>
            {helpText && (
                <p className="text-xs text-muted-foreground">{helpText}</p>
            )}
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    )
}
