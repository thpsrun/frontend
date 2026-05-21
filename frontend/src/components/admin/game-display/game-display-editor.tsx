import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/common/query-error-banner"
import { Skeleton } from "@/components/ui/skeleton"

import {
    useGameDisplay,
    useReorderDisplayItems,
    useSetDisplayVisibility,
} from "@/hooks/admin/useGameDisplay"
import type {
    ReorderScope,
    VisibilityTargetType,
} from "@/types/admin-game-display"

import { SortableSection } from "./sortable-section"

// Renders the category / level / variable-value ordering UI for a single game.
export function GameDisplayEditor({ gameId }: { gameId: string }) {
    const displayQuery = useGameDisplay(gameId)
    const reorder = useReorderDisplayItems(gameId)
    const visibility = useSetDisplayVisibility(gameId)

    const pendingVisibility = visibility.isPending && visibility.variables
        ? visibility.variables
        : null

    const handleReorder = (
        scope: ReorderScope,
        orderedIds: string[],
        varId?: string,
    ) => {
        reorder.mutate({
            scope,
            ordered_ids: orderedIds,
            var_id: varId ?? null,
        })
    }

    const handleVisibility = (
        targetType: VisibilityTargetType,
        targetId: string,
        value: boolean,
    ) => {
        visibility.mutate({
            target_type: targetType,
            target_id: targetId,
            value,
        })
    }

    const data = displayQuery.data
    const pendingCategoryId =
        pendingVisibility?.target_type === "category"
            ? pendingVisibility.target_id
            : null
    const pendingVariableValueId =
        pendingVisibility?.target_type === "variable_value"
            ? pendingVisibility.target_id
            : null

    return (
        <div className="flex flex-col gap-6">
            {displayQuery.error && (
                <QueryErrorBanner
                    error={displayQuery.error}
                    onRetry={displayQuery.refetch}
                />
            )}

            {displayQuery.isLoading && (
                <Panel className="p-5">
                    <Skeleton className="h-6 w-32 mb-3" />
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </Panel>
            )}

            {data && (
                <>
                    <SortableSection
                        title="Categories"
                        description="Drag to reorder. Toggle to show or hide on the main page."
                        items={data.categories}
                        showVisibility
                        visibilityTargetType="category"
                        emptyMessage="No categories for this game."
                        onReorder={(ids) => handleReorder("category", ids)}
                        onVisibilityChange={handleVisibility}
                        pendingItemId={pendingCategoryId}
                    />

                    <SortableSection
                        title="Levels"
                        description="Drag to reorder. Levels are not toggleable on the main page."
                        items={data.levels}
                        showVisibility={false}
                        emptyMessage="No levels for this game."
                        onReorder={(ids) => handleReorder("level", ids)}
                    />

                    {data.variable_groups.map((group) => (
                        <SortableSection
                            key={group.variable_id}
                            title={`Variable: ${group.variable_name}`}
                            description="Drag to reorder values. Toggle to show or hide on the main page."
                            items={group.values}
                            showVisibility
                            visibilityTargetType="variable_value"
                            emptyMessage={`No values for ${group.variable_name}.`}
                            onReorder={(ids) =>
                                handleReorder(
                                    "variable_value",
                                    ids,
                                    group.variable_id,
                                )
                            }
                            onVisibilityChange={handleVisibility}
                            pendingItemId={pendingVariableValueId}
                        />
                    ))}
                </>
            )}
        </div>
    )
}
