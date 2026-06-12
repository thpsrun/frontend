import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { VariableToggles } from "@/components/leaderboard/variable-toggles"
import { cn } from "@/lib/utils"
import type { CategoryVariable } from "@/types/api"

interface LeaderboardFiltersButtonProps {
    variables: CategoryVariable[]
    valueSlugs: string[]
    onValueChange: (groupIndex: number, slug: string) => void

    summary: string
}

export const LeaderboardFiltersButton = ({
    variables,
    valueSlugs,
    onValueChange,
    summary,
}: LeaderboardFiltersButtonProps) => {
    const [open, setOpen] = useState(false)

    if (variables.length === 0) return null

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                className={cn(
                    "flex w-full items-center gap-2 rounded-lg border border-border/60",
                    "bg-card/60 px-3 py-2 text-sm",
                )}
            >
                <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">Subcategories</span>
                <span className="ml-auto truncate font-medium">{summary}</span>
            </SheetTrigger>
            <SheetContent
                side="bottom"
                className="max-h-[80vh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            >
                <SheetHeader>
                    <SheetTitle>Subcategories</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto px-4 pb-4">
                    <VariableToggles
                        variables={variables}
                        valueSlugs={valueSlugs}
                        onValueChange={onValueChange}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
