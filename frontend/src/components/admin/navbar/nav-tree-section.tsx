import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import type { NavbarAdminItem } from "@/types/admin-navbar"

import { NavTreeRow } from "./nav-tree-row"

interface Props {
    items: NavbarAdminItem[]
    parentId: number | null
    depth: number
    onEdit: (item: NavbarAdminItem) => void
    onDelete: (item: NavbarAdminItem) => void
    onAddChild: (parent: NavbarAdminItem) => void
    onToggleVisible: (item: NavbarAdminItem, value: boolean) => void
    onReorder: (parentId: number | null, orderedIds: number[]) => void
    pendingItemId: number | null
}

export function NavTreeGroup({
    items,
    parentId,
    depth,
    onEdit,
    onDelete,
    onAddChild,
    onToggleVisible,
    onReorder,
    pendingItemId,
}: Props) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Require a small drag distance before activating so plain clicks still reach the
            // buttons and switch inside each row.
            activationConstraint: { distance: 4 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return
        const next = arrayMove(items, oldIndex, newIndex)
        onReorder(parentId, next.map((i) => i.id))
    }

    if (items.length === 0) return null

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="space-y-2">
                            <NavTreeRow
                                item={item}
                                depth={depth}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAddChild={onAddChild}
                                onToggleVisible={onToggleVisible}
                                isPending={pendingItemId === item.id}
                            />
                            {item.children.length > 0 && (
                                <div className="ml-8 border-l border-border/40 pl-3">
                                    <NavTreeGroup
                                        items={item.children}
                                        parentId={item.id}
                                        depth={depth + 1}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onAddChild={onAddChild}
                                        onToggleVisible={onToggleVisible}
                                        onReorder={onReorder}
                                        pendingItemId={pendingItemId}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}
