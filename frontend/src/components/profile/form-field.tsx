import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<typeof Input>

interface FormFieldProps extends InputProps {
    label: ReactNode
    description?: ReactNode
    error?: ReactNode
    fieldClassName?: string
}

export function FormField({
    label,
    description,
    error,
    fieldClassName,
    id,
    type,
    "aria-invalid": ariaInvalidProp,
    "aria-describedby": ariaDescribedByProp,
    ...inputProps
}: FormFieldProps) {
    const errorId = error && id ? `${id}-error` : undefined
    const descriptionId = description && id ? `${id}-description` : undefined
    const describedBy = [ariaDescribedByProp, errorId, descriptionId]
        .filter(Boolean)
        .join(" ") || undefined
    const ariaInvalid = ariaInvalidProp ?? (error ? true : undefined)

    return (
        <div className={cn("flex flex-col gap-2", fieldClassName)}>
            <Label htmlFor={id}>{label}</Label>
            {/* Password fields get the show/hide toggle variant, which manages its own
                input type, so type is not forwarded to it. */}
            {type === "password" ? (
                <PasswordInput
                    id={id}
                    aria-invalid={ariaInvalid}
                    aria-describedby={describedBy}
                    {...inputProps}
                />
            ) : (
                <Input
                    id={id}
                    type={type}
                    aria-invalid={ariaInvalid}
                    aria-describedby={describedBy}
                    {...inputProps}
                />
            )}
            {error ? (
                <p
                    id={errorId}
                    className={cn("text-xs", "text-destructive")}
                >
                    {error}
                </p>
            ) : description ? (
                <p
                    id={descriptionId}
                    className={cn("text-xs", "text-muted-foreground")}
                >
                    {description}
                </p>
            ) : null}
        </div>
    )
}
