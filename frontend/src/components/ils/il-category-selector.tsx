import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { cn } from "@/lib/utils"

import type { GameCategory } from "@/types/api"


interface ILCategorySelectorProps {
    categories: GameCategory[]
    activeCatSlug: string
    onCategoryChange: (slug: string) => void
    dropdownThreshold?: number
    showSingle?: boolean
}

export const ILCategorySelector = ({
    categories,
    activeCatSlug,
    onCategoryChange,
    dropdownThreshold = 6,
    showSingle = false,
}: ILCategorySelectorProps) => {
    if (categories.length > dropdownThreshold) {
        return (
            <div className="w-full max-w-xs">
                <Select
                    value={activeCatSlug}
                    onValueChange={onCategoryChange}
                >
                    <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                        {categories.map((cat) => (
                            <SelectItem
                                key={cat.id}
                                value={cat.slug}
                                className="truncate"
                            >
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )
    }

    if (categories.length > 1) {
        return (
            <Tabs
                value={activeCatSlug}
                onValueChange={onCategoryChange}
            >
                <TabsList className={cn(
                    "flex w-full gap-1 bg-muted/20 p-1 rounded-md",
                    "flex-nowrap overflow-x-auto",
                    "lg:flex-wrap lg:overflow-x-visible",
                )}>
                    {categories.map((cat) => (
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
        )
    }

    if (categories.length === 1 && showSingle) {
        return (
            <div className={cn(
                "flex self-start",
                "bg-muted/20 p-1",
                "rounded-md",
            )}>
                <div className={cn(
                    "px-3 py-1",
                    "rounded-sm",
                    "text-xs",
                    "bg-background shadow",
                )}>
                    {categories[0].name}
                </div>
            </div>
        )
    }

    return null
}
