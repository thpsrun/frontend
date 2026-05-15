import { apiFetch, ApiError } from "@/lib/api-client"
import type {
    AuthMe,
    LoginRequest,
    RegisterRequest,
    VerifySrcRequest,
    RegisterResponse,
    SessionState,
    AllauthSessionResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    PfpResponse,
    ProfileBgResponse,
    Country,
    SRCKeyStatusResponse,
    LoginOptions,
} from "@/types/auth"

export interface LoginResult {
    success: boolean
    mfaRequired: boolean
    emailVerificationRequired: boolean
}

export async function checkSession(signal?: AbortSignal): Promise<SessionState> {
    try {
        const body = await apiFetch<AllauthSessionResponse>(
            "/auth/session",
            { base: "allauth", signal },
        )
        return { isAuthenticated: true, user: body.data.user }
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            return { isAuthenticated: false }
        }
        throw err
    }
}

export const fetchProfile = (signal?: AbortSignal): Promise<AuthMe> =>
    apiFetch<AuthMe>("/auth/me", { signal })

export const fetchCountries = (signal?: AbortSignal): Promise<Country[]> =>
    apiFetch<Country[]>("/countries", { signal })

export async function loginFn(
    data: LoginRequest,
    options: LoginOptions = { rememberMe: false },
): Promise<LoginResult> {
    try {
        await apiFetch<AllauthSessionResponse>(
            "/auth/login",
            {
                base: "allauth",
                method: "POST",
                json: data,
                rememberMe: options.rememberMe,
            },
        )
        return {
            success: true,
            mfaRequired: false,
            emailVerificationRequired: false,
        }
    } catch (err) {
        if (!(err instanceof ApiError)) throw err
        if (err.status !== 401) throw err

        const body = err.body as AllauthSessionResponse | null
        const hasMfa = body?.data?.flows?.some((f) => f.id === "mfa_authenticate")
        if (hasMfa) {
            return {
                success: false,
                mfaRequired: true,
                emailVerificationRequired: false,
            }
        }
        const emailPending = body?.data?.flows?.some(
            (f) => f.id === "verify_email" && f.is_pending,
        )
        if (emailPending) {
            return {
                success: false,
                mfaRequired: false,
                emailVerificationRequired: true,
            }
        }
        throw new Error("Invalid credentials. Please try again.")
    }
}

export async function submitTotpFn(code: string): Promise<void> {
    try {
        await apiFetch(
            "/auth/2fa/authenticate",
            { base: "allauth", method: "POST", json: { code } },
        )
    } catch (err) {
        if (err instanceof ApiError && err.status === 429) {
            throw new Error("Too many attempts. Please wait and try again.")
        }
        throw new Error("Invalid code. Please try again.")
    }
}

export async function logoutFn(): Promise<void> {
    try {
        await apiFetch(
            "/auth/session",
            { base: "allauth", method: "DELETE" },
        )
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) return
        throw err
    }
}

export const registerFn = (data: RegisterRequest): Promise<RegisterResponse> =>
    apiFetch<RegisterResponse>(
        "/auth/register",
        { method: "POST", json: data },
    )

export const updateProfileFn = (data: UpdateProfileRequest): Promise<AuthMe> =>
    apiFetch<AuthMe>(
        "/auth/me",
        { method: "PATCH", json: data },
    )

export const uploadPfpFn = (file: File): Promise<PfpResponse> => {
    const formData = new FormData()
    formData.append("file", file)
    return apiFetch<PfpResponse>(
        "/auth/me/pfp",
        { method: "POST", body: formData },
    )
}

export const uploadProfileBgFn = (file: File): Promise<ProfileBgResponse> => {
    const formData = new FormData()
    formData.append("file", file)
    return apiFetch<ProfileBgResponse>(
        "/auth/me/profile-bg",
        { method: "POST", body: formData },
    )
}

export const deleteProfileBgFn = (): Promise<ProfileBgResponse> =>
    apiFetch<ProfileBgResponse>("/auth/me/profile-bg", { method: "DELETE" })

export const deleteAccountFn = (): Promise<void> =>
    apiFetch<void>("/auth/me", { method: "DELETE" })

export const setSrcKeyFn = (
    data: VerifySrcRequest,
): Promise<SRCKeyStatusResponse> =>
    apiFetch<SRCKeyStatusResponse>(
        "/auth/me/src-key",
        { method: "POST", json: data },
    )

export const deleteSrcKeyFn = (): Promise<void> =>
    apiFetch<void>("/auth/me/src-key", { method: "DELETE" })

export const changePasswordFn = (data: ChangePasswordRequest): Promise<void> =>
    apiFetch<void>(
        "/account/password/change",
        { base: "allauth", method: "POST", json: data },
    )

export const reauthenticateFn = (password: string): Promise<void> =>
    apiFetch<void>(
        "/auth/reauthenticate",
        { base: "allauth", method: "POST", json: { password } },
    )
