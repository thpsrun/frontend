import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Panel } from "@/components/ui/panel"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

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
    rulesHasAny: boolean
    onShowRules: () => void
}

export const ILFilterPanel = ({
    ilCategories,
    activeCatSlug,
    variables,
    valueSlugs,
    onCategoryChange,
    onValueChange,
    rulesHasAny,
    onShowRules,
}: ILFilterPanelProps) => {
    return (
        <Panel className="px-4 py-3 flex flex-col gap-3">
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

            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <VariableToggles
                        variables={variables}
                        valueSlugs={valueSlugs}
                        onValueChange={onValueChange}
                    />
                </div>
                {rulesHasAny && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onShowRules}
                        className="shrink-0 text-xs"
                    >
                        <BookOpen className="size-3.5" />
                        Rules
                    </Button>
                )}
            </div>
        </Panel>
    )
}
