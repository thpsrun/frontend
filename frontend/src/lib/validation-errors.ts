import type { FieldValues, Path, UseFormReturn } from "react-hook-form"
import { ApiError } from "./api-client"

export type FieldErrors = Record<string, string>

export type ParsedValidationErrors = {
    fieldErrors: FieldErrors
    formError: string | null
}

type DetailDictShape = { errors?: Record<string, unknown> }
type DetailExceptionShape = { exception?: unknown }
type ErrorArrayShape = {
    errors?: Array<{ loc?: unknown; msg?: unknown }>
}

const MESSAGE_OVERRIDES: Readonly<Record<string, string>> = {
    "Content contained no allowed elements after sanitization":
        "This was empty after we removed HTML or scripts. Only use Markdown.",
}

function friendly(message: string): string {
    return MESSAGE_OVERRIDES[message] ?? message
}

export function parseValidationErrors(
    err: unknown,
): ParsedValidationErrors | null {
    if (!(err instanceof ApiError) || !err.isValidation) return null
    const body = (err.body ?? {}) as Record<string, unknown>
    const result: ParsedValidationErrors = {
        fieldErrors: {},
        formError: null,
    }

    const details = body.details as Record<string, unknown> | undefined
    if (details && typeof details === "object") {
        const dict = (details as DetailDictShape).errors
        if (dict && typeof dict === "object" && !Array.isArray(dict)) {
            for (const [field, message] of Object.entries(dict)) {
                if (typeof message === "string") {
                    result.fieldErrors[field] = friendly(message)
                }
            }
        }
        const exc = (details as DetailExceptionShape).exception
        if (typeof exc === "string") {
            result.formError = friendly(exc)
        } else if (Array.isArray(exc)) {
            result.formError = exc
                .filter((s): s is string => typeof s === "string")
                .map(friendly)
                .join(" ")
        }
    }

    const arr = (body as ErrorArrayShape).errors
    if (Array.isArray(arr)) {
        for (const item of arr) {
            const loc = Array.isArray(item.loc) ? item.loc : null
            const field = typeof loc?.[loc.length - 1] === "string"
                ? (loc[loc.length - 1] as string)
                : null
            const msg = typeof item.msg === "string" ? item.msg : null
            if (field && msg) {
                result.fieldErrors[field] = friendly(msg)
            }
        }
    }

    if (
        Object.keys(result.fieldErrors).length === 0
        && result.formError === null
    ) {
        result.formError = err.message
    }
    return result
}

export function applyValidationErrors<T extends FieldValues>(
    err: unknown,
    form: UseFormReturn<T>,
    knownFields: ReadonlyArray<Path<T>>,
): string | null {
    const parsed = parseValidationErrors(err)
    if (parsed) {
        let mappedAny = false
        for (const [field, message] of Object.entries(parsed.fieldErrors)) {
            if (knownFields.includes(field as Path<T>)) {
                form.setError(field as Path<T>, { message })
                mappedAny = true
            }
        }
        if (parsed.formError) return parsed.formError
        if (!mappedAny) return "Save failed."
        return null
    }
    if (err instanceof ApiError) return err.message
    if (err instanceof Error) return err.message
    return "Save failed."
}
