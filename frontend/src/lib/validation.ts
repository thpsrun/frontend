import type { ZodType } from "zod"
import { slugify } from "@/lib/utils"
import {
    apiKeyLabelSchema,
    emailSchema,
    guideContentSchema,
    guideShortDescriptionSchema,
    guideTitleSchema,
    navItemNameSchema,
    navUrlSchema,
    passwordSchema,
    reviewNotesSchema,
    socialUrlSchema,
    tagDescriptionSchema,
    tagNameSchema,
    usernameSchema,
} from "@/lib/schemas"

function firstError<T>(schema: ZodType<T>, value: unknown): string | null {
    const result = schema.safeParse(value)
    return result.success ? null : (result.error.issues[0]?.message ?? "Invalid value.")
}

export const validateUsername = (v: string): string | null =>
    firstError(usernameSchema, v)

export const validatePassword = (v: string): string | null =>
    firstError(passwordSchema, v)

export const validateApiKeyLabel = (v: string): string | null =>
    firstError(apiKeyLabelSchema, v)

export const validateEmail = (v: string): string | null =>
    firstError(emailSchema, v)

export const validateGuideTitle = (v: string): string | null =>
    firstError(guideTitleSchema, v)

export const validateGuideShortDescription = (v: string): string | null =>
    firstError(guideShortDescriptionSchema, v)

export const validateGuideContent = (v: string): string | null =>
    firstError(guideContentSchema, v)

export function validateGuideSlug(
    v: string,
    required: boolean,
): string | null {
    const trimmed = v.trim()
    if (!trimmed) return required ? "Slug is required." : null
    const slug = slugify(trimmed)
    if (!slug) return "Slug must contain at least one letter or number."
    if (slug.length > 200) return "Slug must be 200 characters or fewer."
    return null
}

export const validateTagName = (v: string): string | null =>
    firstError(tagNameSchema, v)

export const validateTagDescription = (v: string): string | null =>
    firstError(tagDescriptionSchema, v)

export const validateNavItemName = (v: string): string | null =>
    firstError(navItemNameSchema, v)

export const validateNavUrl = (v: string): string | null =>
    firstError(navUrlSchema, v)

export const validateSocialUrl = (v: string): string | null =>
    firstError(socialUrlSchema, v)

export const validateReviewNotes = (v: string): string | null =>
    firstError(reviewNotesSchema, v)
