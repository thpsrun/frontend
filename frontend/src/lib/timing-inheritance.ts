import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

type RequiredMethodsBearer = {
    required_methods: TimingMethodType[] | null
}
type DefaultTimeBearer = {
    defaulttime: TimingMethodType | null
}

export function effectiveRequiredMethods(
    entity: RequiredMethodsBearer,
    chain: ReadonlyArray<RequiredMethodsBearer>,
): TimingMethodType[] {
    if (entity.required_methods) return entity.required_methods
    for (const parent of chain) {
        if (parent.required_methods) return parent.required_methods
    }
    return [...ALL_TIMING_METHODS]
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
        required_methods_fg: TimingMethodType[]
        required_methods_il: TimingMethodType[]
    }
    category: {
        defaulttime: TimingMethodType | null
        required_methods: TimingMethodType[] | null
    } | null
    selections: ReadonlyArray<{
        variable: RequiredMethodsBearer & DefaultTimeBearer
        value: RequiredMethodsBearer & DefaultTimeBearer
    }>
}

export interface LeaderboardMethodsResult {
    requiredMethods: TimingMethodType[]
    primaryMethod: TimingMethodType
}

// Resolve the display-config for a leaderboard view by walking the
// Value > Variable > Category > Game chain for both required_methods and
// defaulttime. For "fg" scope reads game.{defaulttime,required_methods_fg};
// for "il" scope reads game.{idefaulttime,required_methods_il}.
export function resolveLeaderboardMethods(
    input: LeaderboardMethodsInput,
): LeaderboardMethodsResult {
    const gameDefault = input.scope === "fg"
        ? input.game.defaulttime
        : input.game.idefaulttime
    const gameRequired = input.scope === "fg"
        ? input.game.required_methods_fg
        : input.game.required_methods_il

    let required: TimingMethodType[] | null = null
    let primary: TimingMethodType | null = null

    for (const { value } of input.selections) {
        if (!required && value.required_methods) required = value.required_methods
        if (!primary && value.defaulttime) primary = value.defaulttime
    }
    for (const { variable } of input.selections) {
        if (!required && variable.required_methods) {
            required = variable.required_methods
        }
        if (!primary && variable.defaulttime) {
            primary = variable.defaulttime
        }
    }
    if (!required && input.category?.required_methods) {
        required = input.category.required_methods
    }
    if (!primary && input.category?.defaulttime) {
        primary = input.category.defaulttime
    }
    if (!required) required = gameRequired
    if (!primary) primary = gameDefault

    const finalRequired = required.length > 0 ? required : [...ALL_TIMING_METHODS]
    const fallbackPrimary = finalRequired.includes("rta")
        ? "rta"
        : finalRequired[0]
    const finalPrimary: TimingMethodType = primary
        && finalRequired.includes(primary)
        ? primary
        : fallbackPrimary

    return { requiredMethods: finalRequired, primaryMethod: finalPrimary }
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

// Companion to timeForMethod — pulls the numeric seconds field for the
// same method. Use this for "is the time actually recorded?" checks; the
// formatted string may be "0:00.000" or similar when secs is 0/null.
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
