import { getGradientStyle, type Gradients } from "@/lib/gradients"
import { cn } from "@/lib/utils"

interface GradientUsernameProps {
    name: string
    gradients: Gradients | null | undefined
    className?: string
}

export function GradientUsername({
    name,
    gradients,
    className,
}: GradientUsernameProps) {
    const style = getGradientStyle(gradients)

    return (
        <span className={cn(className)} style={style}>
            {name}
        </span>
    )
}
