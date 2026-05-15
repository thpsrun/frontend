import type { LeaderboardTarget, ReconcileScope } from "@/types/reconcile"

interface TargetLike {
    scope?: ReconcileScope
    target_id: string | null
    target_descriptor: Record<string, unknown> | null
}

function asLeaderboardTarget(
    desc: Record<string, unknown>,
): LeaderboardTarget | null {
    if (typeof desc.game_id !== "string") return null
    if (typeof desc.category_id !== "string") return null
    return desc as unknown as LeaderboardTarget
}

export function describeTarget(input: TargetLike): string {
    if (input.scope === "SERIES") return "(all series)"
    if (input.target_id) return input.target_id
    const target = input.target_descriptor && asLeaderboardTarget(input.target_descriptor)
    if (target) {
        const parts = [target.game_id, target.category_id]
        if (target.level_id) parts.push(target.level_id)
        return parts.join(" / ")
    }
    return "-"
}
