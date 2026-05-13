export function reorderArrayByIds<
    Id extends string | number,
    T extends { id: Id },
>(items: T[], orderedIds: Id[]): T[] {
    const lookup = new Map(items.map((item) => [item.id, item]))
    const orderedSet = new Set(orderedIds)
    const result: T[] = []
    for (const id of orderedIds) {
        const item = lookup.get(id)
        if (item) result.push(item)
    }
    for (const item of items) {
        if (!orderedSet.has(item.id)) result.push(item)
    }
    return result
}
