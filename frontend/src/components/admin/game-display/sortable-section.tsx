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
import { Inbox } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { SectionPanel } from "@/components/profile/section-panel"
import type {
    DisplayItem,
    VisibilityTargetType,
} from "@/types/admin-game-display"

import { SortableRow } from "./sortable-row"

interface SortableSectionProps {
    title: string
    description?: string
    items: DisplayItem[]
    showVisibility: boolean
    visibilityTargetType?: VisibilityTargetType
    emptyMessage: string
    onReorder: (orderedIds: string[]) => void
    onVisibilityChange?: (
        targetType: VisibilityTargetType,
        targetId: string,
        value: boolean,
    ) => void
    pendingItemId?: string | null
}

export function SortableSection({
    title,
    description,
    items,
    showVisibility,
    visibilityTargetType,
    emptyMessage,
    onReorder,
    onVisibilityChange,
    pendingItemId = null,
}: SortableSectionProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
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
        onReorder(next.map((i) => i.id))
    }

    return (
        <SectionPanel title={title} description={description}>
            {items.length === 0 ? (
                <EmptyState
                    inset
                    icon={Inbox}
                    title={emptyMessage}
                />
            ) : (
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
                                <SortableRow
                                    key={item.id}
                                    item={item}
                                    showVisibility={showVisibility}
                                    visibilityTargetType={visibilityTargetType}
                                    onVisibilityChange={onVisibilityChange}
                                    isPending={pendingItemId === item.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </SectionPanel>
    )
}
