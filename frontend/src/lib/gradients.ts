import type { CSSProperties } from "react"

export interface Gradients {
    gradient_1: string | null
    gradient_2: string | null
    gradient_3: string | null
}

/**
 * Left-pack gradient slots so there are never gaps.
 * Returns a new tuple [g1, g2, g3].
 */
export function normalizeGradients(
    g1: string | null,
    g2: string | null,
    g3: string | null,
): [string | null, string | null, string | null] {
    const filled = [g1, g2, g3].filter(
        (c): c is string => c != null && c.trim() !== "",
    )
    return [
        filled[0] ?? null,
        filled[1] ?? null,
        filled[2] ?? null,
    ]
}

/**
 * Compute CSS properties for a gradient-styled username.
 * Returns empty object when no gradients are set.
 */
export function getGradientStyle(
    gradients: Gradients | null | undefined,
): CSSProperties {
    if (!gradients) return {}

    const colors = [
        gradients.gradient_1,
        gradients.gradient_2,
        gradients.gradient_3,
    ].filter((c): c is string => c != null && c.trim() !== "")

    if (colors.length === 0) return {}

    if (colors.length === 1) {
        return { color: colors[0] }
    }

    const stops = colors.length === 2
        ? `${colors[0]} 0%, ${colors[1]} 100%`
        : `${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%`

    return {
        backgroundImage: `linear-gradient(to right, ${stops})`,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    }
}
