import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Width = "sm" | "md" | "lg"
type Spacing = "none" | "tight" | "default"

interface PageShellProps {
    width?: Width
    spacing?: Spacing
    className?: string
    children: ReactNode
}

const widthClasses: Record<Width, string> = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
}

const spacingClasses: Record<Spacing, string> = {
    none: "",
    tight: "space-y-4",
    default: "space-y-6",
}

export function PageShell({
    width = "md",
    spacing = "default",
    className,
    children,
}: PageShellProps) {
    return (
        <div
            className={cn(
                "mx-auto px-4",
                widthClasses[width],
                spacingClasses[spacing],
                className,
            )}
        >
            {children}
        </div>
    )
}
