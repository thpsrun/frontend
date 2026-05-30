import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    GripVertical,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { NavbarAdminItem } from "@/types/admin-navbar"

export const MAX_NAV_DEPTH = 4

interface Props {
    item: NavbarAdminItem
    depth: number
    onEdit: (item: NavbarAdminItem) => void
    onDelete: (item: NavbarAdminItem) => void
    onAddChild: (parent: NavbarAdminItem) => void
    onToggleVisible: (item: NavbarAdminItem, value: boolean) => void
    isPending?: boolean
}

export function NavTreeRow({
    item,
    depth,
    onEdit,
    onDelete,
    onAddChild,
    onToggleVisible,
    isPending = false,
}: Props) {
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

    const canAddChild = depth < MAX_NAV_DEPTH
    const canDelete = item.children.length === 0

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-2 rounded-md border border-border/40",
                "bg-background/60 px-2 py-2 transition-opacity",
                isDragging && "opacity-60",
                isPending && "opacity-50",
                !item.is_visible && "border-dashed",
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

            <div className="flex flex-1 flex-col min-w-0">
                <span className={cn(
                    "text-sm font-medium truncate",
                    !item.is_visible && "text-muted-foreground",
                )}>
                    {item.name}
                </span>
                <span className={cn(
                    "text-xs text-muted-foreground truncate font-mono",
                )}>
                    {item.url ?? "(no link)"}
                </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <div className="flex items-center gap-2 mr-1 text-xs text-muted-foreground">
                    <span className="hidden sm:inline">
                        {item.is_visible ? "Visible" : "Hidden"}
                    </span>
                    <Switch
                        checked={item.is_visible}
                        onCheckedChange={(v) => onToggleVisible(item, v)}
                        aria-label={`Toggle visibility for ${item.name}`}
                        disabled={isPending}
                    />
                </div>

                {canAddChild && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddChild(item)}
                        aria-label={`Add child under ${item.name}`}
                        title="Add child item"
                    >
                        <Plus className="size-4" />
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                    aria-label={`Edit ${item.name}`}
                >
                    <Pencil className="size-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item)}
                    disabled={!canDelete}
                    aria-label={`Delete ${item.name}`}
                    title={
                        canDelete
                            ? "Delete"
                            : "Remove or reparent children first"
                    }
                    className={cn(
                        canDelete && "text-destructive hover:text-destructive",
                    )}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    )
}
