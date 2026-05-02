import { type ReactNode } from "react"
import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"

interface Props {
    icon?: ReactNode
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

export function EmptyState({ icon, title, description, action, className }: Props) {
    return (
        <Panel className={cn("p-10 text-center", className)}>
            {icon && <div className="mx-auto mb-3 text-muted-foreground">{icon}</div>}
            <h3 className="text-base font-medium">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
            {action && <div className="mt-4 flex justify-center">{action}</div>}
        </Panel>
    )
}
