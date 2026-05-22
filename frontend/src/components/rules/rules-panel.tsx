import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RulesContent } from "@/components/rules/rules-content"
import { cn } from "@/lib/utils"
import type { RulesView } from "@/lib/rules"

interface RulesPanelProps {
    view: RulesView
    onClose: () => void
    className?: string
}

export function RulesPanel({
    view,
    onClose,
    className,
}: RulesPanelProps) {
    return (
        <aside
            className={cn(
                "flex flex-col rounded-lg border border-border/40 bg-background/70 shadow-sm",
                "max-h-[calc(85vh-3rem)]",
                className,
            )}
        >
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                <p className="font-display text-lg uppercase tracking-tight leading-none">
                    Rules
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close rules"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="overflow-y-auto p-4">
                <RulesContent view={view} />
            </div>
        </aside>
    )
}
