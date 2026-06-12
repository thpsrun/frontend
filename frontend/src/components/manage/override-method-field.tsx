import { TimingMethodField } from "./timing-method-field"
import type { TimingMethodType } from "@/types/shared"

interface OverrideMethodFieldProps {
    value: TimingMethodType | null
    onChange: (v: TimingMethodType | null) => void
    resolvedPrimary: TimingMethodType
    requiredMethods: ReadonlyArray<TimingMethodType>
    error?: string
}

// Preconfigured TimingMethodField for overriding which timing method counts as primary on a
// single run. A null value means inherit resolvedPrimary (the game or category default).
export function OverrideMethodField({
    value,
    onChange,
    resolvedPrimary,
    requiredMethods,
    error,
}: OverrideMethodFieldProps) {
    return (
        <TimingMethodField
            id="primary-method-override"
            label="Primary Method Override"
            value={value}
            onChange={onChange}
            requiredMethods={requiredMethods}
            allowInherit
            inheritedValue={resolvedPrimary}
            error={error}
            helpText={
                "Override which timing method is treated as primary for "
                + "this run. Usually set to inherit. Override when a legacy "
                + "run lacks data for the game's current primary."
            }
        />
    )
}
