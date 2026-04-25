import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<typeof Input>

interface FormFieldProps extends InputProps {
    label: ReactNode
    description?: ReactNode
    fieldClassName?: string
}

export function FormField({
    label,
    description,
    fieldClassName,
    id,
    ...inputProps
}: FormFieldProps) {
    return (
        <div className={cn("flex flex-col gap-2", fieldClassName)}>
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} {...inputProps} />
            {description && (
                <p
                    className={cn(
                        "text-xs",
                        "text-muted-foreground",
                    )}
                >
                    {description}
                </p>
            )}
        </div>
    )
}
