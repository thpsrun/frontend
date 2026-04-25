import type { ReactNode } from "react"
import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"

interface SectionPanelProps {
    title: ReactNode
    description?: ReactNode
    className?: string
    titleClassName?: string
    children: ReactNode
}

export function SectionPanel({
    title,
    description,
    className,
    titleClassName,
    children,
}: SectionPanelProps) {
    return (
        <Panel className={cn("p-5", className)}>
            <h2
                className={cn(
                    "text-xl font-semibold",
                    !description && "mb-4",
                    titleClassName,
                )}
            >
                {title}
            </h2>
            {description && (
                <p
                    className={cn(
                        "text-sm text-muted-foreground",
                        "mb-4",
                    )}
                >
                    {description}
                </p>
            )}
            {children}
        </Panel>
    )
}
