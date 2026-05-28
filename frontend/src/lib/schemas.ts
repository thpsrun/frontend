import { z } from "zod"

// Reusable: required, trimmed, length-bounded text field.
const requiredText = (max: number, label: string) =>
    z.string()
        .trim()
        .min(1, `${label} is required.`)
        .max(max, `${label} must be ${max} characters or fewer.`)

// Reusable: control-character check for URL inputs. The control chars
// are precisely what we want to reject
// eslint-disable-next-line no-control-regex
const URL_CONTROL_CHARS = /[\x00-\x1F\x7F]/

export const usernameSchema = z.string()
    .min(3, "Usernames must be between 3 and 20 characters.")
    .max(20, "Usernames must be between 3 and 20 characters.")
    .regex(
        /^[\w.@+-]+$/,
        "Username can only contain letters, digits, and @/./+/-/_ characters.",
    )

// Printable ASCII range (\x20-\x7E) covers space through tilde; control
// characters and non-ASCII unicode are rejected.
export const passwordSchema = z.string()
    .min(8, "Password must be 8-64 characters.")
    .max(64, "Password must be 8-64 characters.")
    .regex(
        /^[\x20-\x7E]+$/,
        "Password can only contain printable ASCII characters.",
    )

export const emailSchema = z.string()
    .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
    )

export const apiKeyLabelSchema = requiredText(100, "Label")
export const guideTitleSchema = requiredText(200, "Title")
export const guideShortDescriptionSchema = requiredText(500, "Short description")
export const tagNameSchema = requiredText(100, "Tag name")
export const tagDescriptionSchema = requiredText(500, "Tag description")
export const navItemNameSchema = requiredText(100, "Name")

export const guideContentSchema = z.string()
    .min(1, "Content is required.")
    .max(50_000, "Content must be 50,000 characters or fewer.")

// Optional URL: empty is allowed. Accepts /, http://, or https://.
export const navUrlSchema = z.string().superRefine((val, ctx) => {
    const trimmed = val.trim()
    if (trimmed.length === 0) return
    if (trimmed.length > 500) {
        ctx.addIssue({
            code: "custom",
            message: "URL must be 500 characters or fewer.",
        })
        return
    }
    if (URL_CONTROL_CHARS.test(trimmed)) {
        ctx.addIssue({
            code: "custom",
            message: "URL contains invalid characters.",
        })
        return
    }
    if (!trimmed.startsWith("/") && !/^https?:\/\//i.test(trimmed)) {
        ctx.addIssue({
            code: "custom",
            message: "URL must start with /, http://, or https://.",
        })
    }
})

// Required URL: must be http:// or https://.
export const socialUrlSchema = z.string().superRefine((val, ctx) => {
    const trimmed = val.trim()
    if (trimmed.length === 0) {
        ctx.addIssue({ code: "custom", message: "URL is required." })
        return
    }
    if (trimmed.length > 500) {
        ctx.addIssue({
            code: "custom",
            message: "URL must be 500 characters or fewer.",
        })
        return
    }
    if (URL_CONTROL_CHARS.test(trimmed)) {
        ctx.addIssue({
            code: "custom",
            message: "URL contains invalid characters.",
        })
        return
    }
    if (!/^https?:\/\//i.test(trimmed)) {
        ctx.addIssue({
            code: "custom",
            message: "URL must start with http:// or https://.",
        })
    }
})

export const reviewNotesSchema = z.string().superRefine((val, ctx) => {
    const trimmed = val.trim()
    if (trimmed.length === 0) {
        ctx.addIssue({ code: "custom", message: "Notes are required." })
        return
    }
    if (trimmed.length < 5) {
        ctx.addIssue({
            code: "custom",
            message: "Notes must be at least 5 characters.",
        })
        return
    }
    if (val.length > 2000) {
        ctx.addIssue({
            code: "custom",
            message: "Notes must be 2000 characters or fewer.",
        })
    }
})

// Compound schema: password change with match check. currentPassword is
// optional because OAuth-only users may set a brand new password without
// providing a current one. The submit handler decides whether to send it
// based on whether the user already has a usable password.
export const passwordChangeSchema = z.object({
    currentPassword: z.string(),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
}).refine(
    (data) => data.newPassword === data.confirmNewPassword,
    {
        message: "New passwords do not match.",
        path: ["confirmNewPassword"],
    },
)

export type PasswordChangeForm = z.infer<typeof passwordChangeSchema>

export const forgotPasswordSchema = z.object({
    email: emailSchema,
})

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
}).refine(
    (data) => data.newPassword === data.confirmNewPassword,
    {
        message: "New passwords do not match!",
        path: ["confirmNewPassword"],
    },
)

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export const emailRecoverySchema = z.object({
    srcApiKey: z.string()
        .min(1, "SRC API key is required."),
    newEmail: emailSchema,
})

export type EmailRecoveryForm = z.infer<typeof emailRecoverySchema>

export const emailChangeSchema = z.object({
    newEmail: emailSchema,
})

export type EmailChangeForm = z.infer<typeof emailChangeSchema>
