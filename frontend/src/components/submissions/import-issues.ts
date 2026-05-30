import {
    isValidYouTubeUrl,
    timeFieldsToSecs,
    type TimeFields,
} from "@/components/submissions/run-form-helpers"
import type {
    ImportIssue,
    InvalidVideoHostIssue,
    MissingTimingMethodsIssue,
} from "@/types/submissions"
import type { TimingMethodType } from "@/types/shared"

export function isInvalidVideoIssue(
    issue: ImportIssue,
): issue is InvalidVideoHostIssue {
    return issue.type === "invalid_video_host"
}

export function isMissingTimingIssue(
    issue: ImportIssue,
): issue is MissingTimingMethodsIssue {
    return issue.type === "missing_timing_methods"
}

const TIMING_LABELS: Record<TimingMethodType, string> = {
    rta: "RTA",
    lrt: "LRT",
    igt: "IGT",
}

export function formatTimingMethods(methods: TimingMethodType[]): string {
    return methods
        .map((m) => TIMING_LABELS[m] ?? String(m).toUpperCase())
        .join(", ")
}

export function formatIssue(issue: ImportIssue): string {
    if (isInvalidVideoIssue(issue)) {
        return "Video is not a YouTube link."
    }
    if (isMissingTimingIssue(issue)) {
        return `Missing required timing: ${formatTimingMethods(issue.methods)}.`
    }
    return `This run has an unrecognized import issue ("${issue.type}").`
}

export interface IssueFormState {
    video: string
    rta: TimeFields
    nl: TimeFields
    igt: TimeFields
}

export interface UnresolvedIssues {
    video: InvalidVideoHostIssue | null
    missingTimingMethods: TimingMethodType[]
}

// Maps a backend timing-method code to the matching form time field.
const METHOD_FIELD: Record<
    TimingMethodType,
    "rta" | "nl" | "igt"
> = {
    rta: "rta",
    lrt: "nl",
    igt: "igt",
}

// Re-checks imported issues against the moderator's current edits so the
// warning box can clear live as problems are fixed.
export function computeUnresolvedIssues(
    issues: ImportIssue[],
    form: IssueFormState,
): UnresolvedIssues {
    let video: InvalidVideoHostIssue | null = null
    const missing = new Set<TimingMethodType>()

    for (const issue of issues) {
        if (isInvalidVideoIssue(issue)) {
            const trimmed = form.video.trim()
            const stillBad = trimmed !== "" && !isValidYouTubeUrl(trimmed)
            if (stillBad) video = issue
        } else if (isMissingTimingIssue(issue)) {
            for (const method of issue.methods) {
                const fieldName = METHOD_FIELD[method]
                if (!fieldName) continue
                if (timeFieldsToSecs(form[fieldName]) === null) {
                    missing.add(method)
                }
            }
        }
    }

    return { video, missingTimingMethods: [...missing] }
}
