import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"

import { cn } from "@/lib/utils"

import type { CategoryVariable } from "@/types/api"


interface VariableTogglesProps {
    variables: CategoryVariable[]
    valueSlugs: string[]
    onValueChange: (groupIndex: number, slug: string) => void
    // Variable toggle is changed to a dropdown after a certain value.
    dropdownThreshold?: number
}

export const VariableToggles = ({
    variables,
    valueSlugs,
    onValueChange,
    dropdownThreshold = Infinity,
}: VariableTogglesProps) => {
    return (
        <>
            {variables.map((variable, vi) => {
                const activeVal = valueSlugs[vi] || ""
                const visibleValues = variable.values.filter(
                    (v) => !v.archive,
                )
                const useDropdown =
                    visibleValues.length > dropdownThreshold

                return (
                    <div
                        key={variable.id}
                        className={cn(
                            "flex flex-col",
                            "gap-2",
                        )}
                    >
                        <div className={cn(
                            "text-xs font-medium",
                            "text-muted-foreground",
                            "uppercase",
                            "tracking-wide",
                        )}>
                            {variable.name}
                        </div>
                        {useDropdown ? (
                            <div className="w-64">
                                <Select
                                    value={activeVal}
                                    onValueChange={(val) =>
                                        onValueChange(vi, val)
                                    }
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "h-8",
                                            "text-xs",
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={
                                                `Select ${variable.name}`
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="max-h-60"
                                    >
                                        {visibleValues.map(
                                            (v) => (
                                            <SelectItem
                                                key={v.slug}
                                                value={v.slug}
                                            >
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className={cn(
                                "flex flex-wrap",
                                "gap-1",
                            )}>
                                {visibleValues.map((v) => {
                                    const active =
                                        activeVal === v.slug
                                    return (
                                        <button
                                            key={v.slug}
                                            onClick={() =>
                                                onValueChange(
                                                    vi,
                                                    v.slug,
                                                )
                                            }
                                            className={cn(
                                                "px-2.5 py-1",
                                                "rounded-md",
                                                "text-xs",
                                                "border",
                                                "transition",
                                                active
                                                    ? "bg-background shadow border-border/60"
                                                    : "bg-muted/30 hover:bg-muted/50 border-transparent",
                                            )}
                                        >
                                            {v.name}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </>
    )
}
