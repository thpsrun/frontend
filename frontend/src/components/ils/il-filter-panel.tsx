import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { cn } from "@/lib/utils"

import { VariableToggles } from "@/components/leaderboard/variable-toggles"

import type {
    GameCategory,
    CategoryVariable,
} from "@/types/api"


interface ILFilterPanelProps {
    ilCategories: GameCategory[]
    activeCatSlug: string
    variables: CategoryVariable[]
    valueSlugs: string[]
    onCategoryChange: (slug: string) => void
    onValueChange: (idx: number, slug: string) => void
}

export const ILFilterPanel = ({
    ilCategories,
    activeCatSlug,
    variables,
    valueSlugs,
    onCategoryChange,
    onValueChange,
}: ILFilterPanelProps) => {
    return (
        <div className={cn(
            "rounded-lg border border-border/40",
            "bg-background/70 backdrop-blur-sm",
            "shadow-sm",
            "px-4 py-3",
            "flex flex-col gap-3",
        )}>
            {/* Category tabs (only if 2+) */}
            {ilCategories.length > 1 && (
                <Tabs
                    value={activeCatSlug}
                    onValueChange={onCategoryChange}
                >
                    <TabsList className={cn(
                        "flex flex-wrap gap-1",
                        "bg-muted/20 p-1",
                        "rounded-md",
                    )}>
                        {ilCategories.map((cat) => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.slug}
                                className={cn(
                                    "px-3 py-1",
                                    "rounded-sm",
                                    "text-xs",
                                    "data-[state=active]:bg-background",
                                    "data-[state=active]:shadow",
                                )}
                            >
                                {cat.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}

            <VariableToggles
                variables={variables}
                valueSlugs={valueSlugs}
                onValueChange={onValueChange}
            />
        </div>
    )
}
