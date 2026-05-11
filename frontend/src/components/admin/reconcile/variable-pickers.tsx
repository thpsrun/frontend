import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import type { CategoryVariable } from "@/types/api"

const ANY_SENTINEL = "__any__"

interface Props {
    variables: CategoryVariable[]
    values: Record<string, string>
    onChange: (values: Record<string, string>) => void
    disabled?: boolean
}

export function VariablePickers({
    variables,
    values,
    onChange,
    disabled,
}: Props) {
    const visible = variables.filter(
        (v) => !v.archive && v.values.some((val) => !val.archive),
    )

    if (visible.length === 0) {
        return (
            <p className="text-xs text-muted-foreground">
                No variables apply to this leaderboard.
            </p>
        )
    }

    function setValue(variableId: string, value: string) {
        const next = { ...values }
        if (value === ANY_SENTINEL) {
            delete next[variableId]
        } else {
            next[variableId] = value
        }
        onChange(next)
    }

    return (
        <div className="space-y-2">
            {visible.map((variable) => {
                const current = values[variable.id] ?? ANY_SENTINEL
                const options = variable.values.filter((val) => !val.archive)
                return (
                    <div key={variable.id} className="space-y-1">
                        <Label
                            htmlFor={`var-${variable.id}`}
                            className="text-xs text-muted-foreground"
                        >
                            {variable.name}
                        </Label>
                        <Select
                            value={current}
                            onValueChange={(next) => setValue(variable.id, next)}
                            disabled={disabled}
                        >
                            <SelectTrigger id={`var-${variable.id}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ANY_SENTINEL}>
                                    <span className="text-muted-foreground">
                                        Any
                                    </span>
                                </SelectItem>
                                {options.map((val) => (
                                    <SelectItem key={val.value} value={val.value}>
                                        {val.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )
            })}
        </div>
    )
}
