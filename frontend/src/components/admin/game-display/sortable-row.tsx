import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type {
    DisplayItem,
    VisibilityTargetType,
} from "@/types/admin-game-display"

interface SortableRowProps {
    item: DisplayItem
    showVisibility: boolean
    visibilityTargetType?: VisibilityTargetType
    onVisibilityChange?: (
        targetType: VisibilityTargetType,
        targetId: string,
        value: boolean,
    ) => void
    isPending?: boolean
}

export function SortableRow({
    item,
    showVisibility,
    visibilityTargetType,
    onVisibilityChange,
    isPending = false,
}: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleSwitchChange = (checked: boolean) => {
        if (!visibilityTargetType || !onVisibilityChange) return
        onVisibilityChange(visibilityTargetType, item.id, checked)
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 rounded-md border border-border/40",
                "bg-background/60 px-3 py-2 transition-opacity",
                isDragging && "opacity-60",
                isPending && "opacity-50",
            )}
        >
            <button
                type="button"
                className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded",
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring cursor-grab active:cursor-grabbing",
                )}
                aria-label={`Reorder ${item.name}`}
                {...attributes}
                {...listeners}
            >
                <GripVertical className="size-4" />
            </button>

            <span className="flex-1 text-sm font-medium">{item.name}</span>

            {showVisibility && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                        {item.appear_on_main ? "Visible" : "Hidden"}
                    </span>
                    {/* appear_on_main is null for items without a main-page flag (levels),
                        hence the coalesce for the controlled switch. */}
                    <Switch
                        checked={item.appear_on_main ?? false}
                        onCheckedChange={handleSwitchChange}
                        aria-label={`Toggle visibility for ${item.name}`}
                        disabled={isPending}
                    />
                </div>
            )}
        </div>
    )
}
