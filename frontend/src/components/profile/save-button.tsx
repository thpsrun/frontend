import { Button } from "@/components/ui/button"

type ButtonProps = React.ComponentProps<typeof Button>

interface SaveButtonProps extends Omit<ButtonProps, "children"> {
    isPending: boolean
    idleLabel?: string
    pendingLabel?: string
}

export function SaveButton({
    isPending,
    idleLabel = "Save Changes",
    pendingLabel = "Saving...",
    type = "submit",
    disabled,
    ...rest
}: SaveButtonProps) {
    return (
        <Button
            type={type}
            disabled={isPending || disabled}
            {...rest}
        >
            {isPending ? pendingLabel : idleLabel}
        </Button>
    )
}
