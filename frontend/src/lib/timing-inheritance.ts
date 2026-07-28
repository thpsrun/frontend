import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

type AllowedMethodsBearer = {
    allowed_methods: TimingMethodType[] | null
}
type RequiredMethodsBearer = {
    required_methods: TimingMethodType[] | null
}
type DefaultTimeBearer = {
    defaulttime: TimingMethodType | null
}

export function effectiveAllowedMethods(
    entity: AllowedMethodsBearer,
    chain: ReadonlyArray<AllowedMethodsBearer>,
): TimingMethodType[] {
    if (entity.allowed_methods) return entity.allowed_methods
    for (const parent of chain) {
        if (parent.allowed_methods) return parent.allowed_methods
    }
    return [...ALL_TIMING_METHODS]
}

export function effectiveRequiredMethods(
    entity: RequiredMethodsBearer,
    chain: ReadonlyArray<RequiredMethodsBearer>,
    effectiveAllowed: ReadonlyArray<TimingMethodType>,
    primary?: TimingMethodType | null,
): TimingMethodType[] {
    let resolved: TimingMethodType[] | null = null
    if (entity.required_methods) {
        resolved = entity.required_methods
    } else {
        for (const parent of chain) {
            if (parent.required_methods) {
                resolved = parent.required_methods
                break
            }
        }
    }
    let out = (resolved ?? [...effectiveAllowed]).filter(
        (m) => effectiveAllowed.includes(m),
    )
    if (primary && effectiveAllowed.includes(primary) && !out.includes(primary)) {
        out.push(primary)
    }
    // Never collapse to empty: a run must supply at least the primary.
    if (out.length === 0) out = [...effectiveAllowed]
    // Canonical method order for stable display.
    return ALL_TIMING_METHODS.filter((m) => out.includes(m))
}

// Normalize a stored required value before sending it to the backend.
export function normalizeRequired(
    required: TimingMethodType[] | null,
    allowed: ReadonlyArray<TimingMethodType>,
    primary: TimingMethodType | null,
): TimingMethodType[] | null {
    if (required == null) return null
    const out = required.filter((m) => allowed.includes(m))
    if (primary && allowed.includes(primary) && !out.includes(primary)) {
        out.push(primary)
    }
    const ordered = ALL_TIMING_METHODS.filter((m) => out.includes(m))
    return ordered.length > 0 ? ordered : null
}

export function effectiveDefaultTime(
    entity: DefaultTimeBearer,
    chain: ReadonlyArray<DefaultTimeBearer>,
): TimingMethodType | null {
    if (entity.defaulttime) return entity.defaulttime
    for (const parent of chain) {
        if (parent.defaulttime) return parent.defaulttime
    }
    return null
}

export interface LeaderboardMethodsInput {
    scope: "fg" | "il"
    game: {
        defaulttime: TimingMethodType | null
        idefaulttime: TimingMethodType | null
        allowed_methods_fg: TimingMethodType[]
        allowed_methods_il: TimingMethodType[]
    }
    category: {
        defaulttime: TimingMethodType | null
        allowed_methods: TimingMethodType[] | null
    } | null
    selections: ReadonlyArray<{
        variable: AllowedMethodsBearer & DefaultTimeBearer
        value: AllowedMethodsBearer & DefaultTimeBearer
    }>
}

export interface LeaderboardMethodsResult {
    allowedMethods: TimingMethodType[]
    primaryMethod: TimingMethodType
}

// Resolve the display-config for a leaderboard view by walking the chain for allowed_methods and defaulttime.
export function resolveLeaderboardMethods(
    input: LeaderboardMethodsInput,
): LeaderboardMethodsResult {
    const gameDefault = input.scope === "fg"
        ? input.game.defaulttime
        : input.game.idefaulttime
    const gameAllowed = input.scope === "fg"
        ? input.game.allowed_methods_fg
        : input.game.allowed_methods_il

    let allowed: TimingMethodType[] | null = null
    let primary: TimingMethodType | null = null

    for (const { value } of input.selections) {
        if (!allowed && value.allowed_methods) allowed = value.allowed_methods
        if (!primary && value.defaulttime) primary = value.defaulttime
    }
    for (const { variable } of input.selections) {
        if (!allowed && variable.allowed_methods) {
            allowed = variable.allowed_methods
        }
        if (!primary && variable.defaulttime) {
            primary = variable.defaulttime
        }
    }
    if (!allowed && input.category?.allowed_methods) {
        allowed = input.category.allowed_methods
    }
    if (!primary && input.category?.defaulttime) {
        primary = input.category.defaulttime
    }
    if (!allowed) allowed = gameAllowed
    if (!primary) primary = gameDefault

    const finalAllowed = allowed.length > 0 ? allowed : [...ALL_TIMING_METHODS]
    const fallbackPrimary = finalAllowed.includes("rta")
        ? "rta"
        : finalAllowed[0]
    const finalPrimary: TimingMethodType = primary
        && finalAllowed.includes(primary)
        ? primary
        : fallbackPrimary

    return { allowedMethods: finalAllowed, primaryMethod: finalPrimary }
}

// Pick the time string for a specific method off the flat LbsRun.times
// shape. Returns null when the run did not record that method.
export function timeForMethod(
    times: {
        time: string
        timenl: string | null
        timeigt: string | null
    },
    method: TimingMethodType,
): string | null {
    switch (method) {
        case "rta":
            return times.time
        case "lrt":
            return times.timenl
        case "igt":
            return times.timeigt
    }
}

export function timeSecsForMethod(
    times: {
        time_secs: number
        timenl_secs: number | null
        timeigt_secs: number | null
    },
    method: TimingMethodType,
): number | null {
    switch (method) {
        case "rta":
            return times.time_secs
        case "lrt":
            return times.timenl_secs
        case "igt":
            return times.timeigt_secs
    }
}
