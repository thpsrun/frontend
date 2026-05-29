import { useCapabilities } from "./useCapabilities"

// Returns true when the current user has `capability` and (when gameId is
// supplied) when that capability is scoped to the given game. Returns
// false while data is still loading - users should treat the field as
// hidden until the answer is known.
export function useHasCapability(
    capability: string,
    gameId?: string,
): boolean {
    const caps = useCapabilities()
    const data = caps.data
    if (!data) return false
    if (!data.capabilities.includes(capability)) return false
    if (gameId === undefined) return true
    return data.games.some((g) => g.id === gameId)
}
