import type { ComponentType, ReactNode } from "react"
import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"

interface Props {
    icon?: ComponentType<{ className?: string }>
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: Props) {
    return (
        <Panel className={cn("px-4 py-10 text-center text-muted-foreground", className)}>
            {Icon && <Icon className="mx-auto mb-3 size-8 opacity-60" />}
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && <p className="mt-1 text-sm">{description}</p>}
            {action && <div className="mt-4 flex justify-center">{action}</div>}
        </Panel>
    )
}
