import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { TimingMethodType } from "@/types/shared"
import { TIMING_METHOD_LABELS, ALL_TIMING_METHODS } from "@/types/shared"

const INHERIT_VALUE = "__inherit__"

interface TimingMethodFieldProps {
    id?: string
    label: string
    value: TimingMethodType | null | undefined
    onChange: (next: TimingMethodType | null) => void
    requiredMethods?: ReadonlyArray<TimingMethodType>
    allowInherit?: boolean
    inheritedValue?: TimingMethodType | null
    error?: string
    disabled?: boolean
    helpText?: string
}

export function TimingMethodField({
    id,
    label,
    value,
    onChange,
    requiredMethods = ALL_TIMING_METHODS,
    allowInherit = false,
    inheritedValue = null,
    error,
    disabled,
    helpText,
}: TimingMethodFieldProps) {
    const inheritLabel = inheritedValue
        ? `Inherit (${TIMING_METHOD_LABELS[inheritedValue]})`
        : "Inherit"
    const selectValue = value == null ? INHERIT_VALUE : value

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Select
                value={selectValue}
                onValueChange={(v) => {
                    onChange(
                        v === INHERIT_VALUE
                            ? null
                            : (v as TimingMethodType),
                    )
                }}
                disabled={disabled}
            >
                <SelectTrigger id={id} className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {allowInherit && (
                        <SelectItem value={INHERIT_VALUE}>
                            {inheritLabel}
                        </SelectItem>
                    )}
                    {requiredMethods.map((m) => (
                        <SelectItem key={m} value={m}>
                            {TIMING_METHOD_LABELS[m]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {helpText && (
                <p className="text-xs text-muted-foreground">{helpText}</p>
            )}
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    )
}
