import { type UseFormRegister, type FieldError } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type LabelDescriptionFormValues = {
    label: string
    description: string
}

type LabelDescriptionFieldsProps = {
    register: UseFormRegister<LabelDescriptionFormValues>
    labelError?: FieldError
    idPrefix?: string
}

export function LabelDescriptionFields({
    register,
    labelError,
    idPrefix = "api-key",
}: LabelDescriptionFieldsProps) {
    const labelId = `${idPrefix}-label`
    const descriptionId = `${idPrefix}-description`

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor={labelId}>Label</Label>
                <Input
                    id={labelId}
                    maxLength={100}
                    aria-invalid={labelError ? "true" : "false"}
                    {...register("label")}
                />
                {labelError && (
                    <span className="text-xs text-destructive">
                        {labelError.message}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor={descriptionId}>
                    Description{" "}
                    <span className="font-normal text-muted-foreground">
                        (optional)
                    </span>
                </Label>
                <textarea
                    id={descriptionId}
                    {...register("description")}
                    className="min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                />
            </div>
        </div>
    )
}
