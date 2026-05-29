import { apiFetch, ApiError } from "@/lib/api-client"
import type {
    CorrectEmailResponse,
    EmailChangeResponse,
    EmailStatusResponse,
} from "@/types/auth"

export interface VerifySignupEmailResult {
    loggedIn: boolean
}

// The backend returns 401 here when verification succeeded but the user
// isn't signed in (the default ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = False
// signup flow). 401 is not a failure on this endpoint; 400 is invalid key and
// 409 is no pending verification.
export async function verifySignupEmailFn(
    code: string,
): Promise<VerifySignupEmailResult> {
    try {
        await apiFetch<void>(
            "/auth/email/verify",
            { base: "allauth", method: "POST", json: { key: code } },
        )
        return { loggedIn: true }
    } catch (err) {
        if (err instanceof ApiError && err.isAuthRequired) {
            return { loggedIn: false }
        }
        throw err
    }
}

export const correctSignupEmailFn = (
    srcApiKey: string,
    newEmail: string,
): Promise<CorrectEmailResponse> =>
    apiFetch<CorrectEmailResponse>(
        "/auth/register/correct-email",
        {
            method: "POST",
            json: { src_api_key: srcApiKey, new_email: newEmail },
        },
    )

export const getEmailStatusFn = (
    signal?: AbortSignal,
): Promise<EmailStatusResponse> =>
    apiFetch<EmailStatusResponse>("/auth/me/email", { signal })

export const requestEmailChangeFn = (
    newEmail: string,
): Promise<EmailChangeResponse> =>
    apiFetch<EmailChangeResponse>(
        "/auth/me/email/change",
        { method: "POST", json: { new_email: newEmail } },
    )

export const verifyEmailChangeFn = (code: string): Promise<unknown> =>
    apiFetch<unknown>(
        "/auth/me/email/verify",
        { method: "POST", json: { code } },
    )

export const resendEmailChangeFn = (): Promise<void> =>
    apiFetch<void>(
        "/auth/me/email/resend",
        { method: "POST" },
    )

export const cancelEmailChangeFn = (): Promise<void> =>
    apiFetch<void>(
        "/auth/me/email/pending",
        { method: "DELETE" },
    )
