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
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    GripVertical,
    Link as LinkIcon,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"
import { Panel } from "@/components/ui/panel"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { getSocialPlatform } from "@/lib/social-platforms"
import type { NavbarAdminSocial } from "@/types/admin-navbar"

interface Props {
    socials: NavbarAdminSocial[]
    onCreate: () => void
    onEdit: (link: NavbarAdminSocial) => void
    onDelete: (link: NavbarAdminSocial) => void
    onToggleVisible: (link: NavbarAdminSocial, value: boolean) => void
    onReorder: (orderedIds: number[]) => void
    pendingId: number | null
}

export function SocialSection({
    socials,
    onCreate,
    onEdit,
    onDelete,
    onToggleVisible,
    onReorder,
    pendingId,
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
        const oldIndex = socials.findIndex((s) => s.id === active.id)
        const newIndex = socials.findIndex((s) => s.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return
        const next = arrayMove(socials, oldIndex, newIndex)
        onReorder(next.map((s) => s.id))
    }

    return (
        <Panel className="p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold">Social Links</h3>
                    <p className="text-xs text-muted-foreground">
                        Drag to reorder. Toggle to show or hide on the navbar.
                    </p>
                </div>
                <Button size="sm" onClick={onCreate} className="gap-1">
                    <Plus className="size-4" /> New Link
                </Button>
            </div>

            {socials.length === 0 ? (
                <EmptyState
                    inset
                    icon={LinkIcon}
                    title="No social links yet."
                />
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={socials.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {socials.map((link) => (
                                <SocialRow
                                    key={link.id}
                                    link={link}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onToggleVisible={onToggleVisible}
                                    isPending={pendingId === link.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </Panel>
    )
}

interface RowProps {
    link: NavbarAdminSocial
    onEdit: (link: NavbarAdminSocial) => void
    onDelete: (link: NavbarAdminSocial) => void
    onToggleVisible: (link: NavbarAdminSocial, value: boolean) => void
    isPending: boolean
}

function SocialRow({
    link,
    onEdit,
    onDelete,
    onToggleVisible,
    isPending,
}: RowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const entry = getSocialPlatform(link.platform)
    const Icon = entry?.Icon ?? LinkIcon
    const platformKnown = Boolean(entry)

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-2 rounded-md border border-border/40",
                "bg-background/60 px-2 py-2 transition-opacity",
                isDragging && "opacity-60",
                isPending && "opacity-50",
                !link.is_visible && "border-dashed",
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
                aria-label={`Reorder ${link.platform}`}
                {...attributes}
                {...listeners}
            >
                <GripVertical className="size-4" />
            </button>

            <Icon
                className={cn(
                    "size-5 shrink-0",
                    platformKnown ? "text-foreground" : "text-muted-foreground",
                )}
            />

            <div className="flex flex-1 flex-col min-w-0">
                <span className={cn(
                    "text-sm font-medium",
                    !link.is_visible && "text-muted-foreground",
                )}>
                    {link.platform}
                    {!platformKnown && (
                        <span className="ml-2 text-xs text-amber-500">
                            no icon registered
                        </span>
                    )}
                </span>
                <span className="text-xs text-muted-foreground truncate font-mono">
                    {link.url}
                </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <div className="flex items-center gap-2 mr-1 text-xs text-muted-foreground">
                    <span className="hidden sm:inline">
                        {link.is_visible ? "Visible" : "Hidden"}
                    </span>
                    <Switch
                        checked={link.is_visible}
                        onCheckedChange={(v) => onToggleVisible(link, v)}
                        aria-label={`Toggle visibility for ${link.platform}`}
                        disabled={isPending}
                    />
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(link)}
                    aria-label={`Edit ${link.platform}`}
                >
                    <Pencil className="size-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(link)}
                    aria-label={`Delete ${link.platform}`}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    )
}
