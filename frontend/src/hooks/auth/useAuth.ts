import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_BASE_URL, ALLAUTH_API_URL } from "@/constants"
import {
    getCsrfToken,
    mutationHeaders,
    handleApiError,
} from "@/lib/api"
import type {
    AuthPlayer,
    LoginRequest,
    RegisterRequest,
    VerifySrcRequest,
    RegisterResponse,
    SessionState,
    AllauthSessionResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    PfpResponse,
    Country,
    SRCKeyStatusResponse,
} from "@/types/auth"

// Returns typed SessionState for both authenticated (200) and unauthenticated (401) responses.
async function checkSession(): Promise<SessionState> {
    const res = await fetch(`${ALLAUTH_API_URL}/auth/session`, {
        credentials: "include",
    })

    if (res.status === 401) {
        return { isAuthenticated: false }
    }

    if (!res.ok) {
        throw new Error(`Session check failed: ${res.status}`)
    }

    const body: AllauthSessionResponse = await res.json()
    return {
        isAuthenticated: true,
        user: body.data.user,
    }
}

// Fetches the player's profile and information from the authentication endpoint.
async function fetchProfile(): Promise<AuthPlayer> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
    })

    if (!res.ok) {
        throw new Error(`Profile fetch failed: ${res.status}`)
    }

    return res.json()
}

export interface LoginResult {
    success: boolean
    mfaRequired: boolean
    emailVerificationRequired: boolean
}

// Authenticate via allauth browser API. Handles MFA and email verification flows.
// Allauth returns 401 for multiple reasons: MFA required, email unverified,
// or bad credentials. We check the flows array to distinguish.
async function loginFn(data: LoginRequest): Promise<LoginResult> {
    const res = await fetch(`${ALLAUTH_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (res.status === 200) {
        return {
            success: true,
            mfaRequired: false,
            emailVerificationRequired: false,
        }
    }

    if (res.status === 401) {
        const body: AllauthSessionResponse = await res.json()
        const hasMfa = body.data.flows?.some(
            (f) => f.id === "mfa_authenticate",
        )
        if (hasMfa) {
            return {
                success: false,
                mfaRequired: true,
                emailVerificationRequired: false,
            }
        }
        const emailPending = body.data.flows?.some(
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

    return handleApiError(res, "Login failed")
}

async function submitTotpFn(code: string): Promise<void> {
    const res = await fetch(`${ALLAUTH_API_URL}/auth/2fa/authenticate`, {
        method: "POST",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify({ code }),
    })

    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Too many attempts. Please wait and try again.")
        }
        throw new Error("Invalid code. Please try again.")
    }
}

// Logout via allauth
async function logoutFn(): Promise<void> {
    const res = await fetch(`${ALLAUTH_API_URL}/auth/session`, {
        method: "DELETE",
        credentials: "include",
        headers: mutationHeaders(),
    })

    // 401 means already logged out - treat as success
    if (!res.ok && res.status !== 401) {
        throw new Error(`Logout failed: ${res.status}`)
    }
}

async function registerFn(
    data: RegisterRequest,
): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (!res.ok) await handleApiError(res, "Registration failed")
    return res.json()
}

async function fetchCountries(): Promise<Country[]> {
    const res = await fetch(`${API_BASE_URL}/auth/countries`, {
        credentials: "include",
    })

    if (!res.ok) await handleApiError(res, "Countries fetch failed")
    return res.json()
}

async function updateProfileFn(
    data: UpdateProfileRequest,
): Promise<AuthPlayer> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (!res.ok) await handleApiError(res, "Update failed")
    return res.json()
}

async function uploadPfpFn(file: File): Promise<PfpResponse> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${API_BASE_URL}/auth/me/pfp`, {
        method: "POST",
        credentials: "include",
        headers: {
            "X-CSRFToken": getCsrfToken(),
        },
        body: formData,
    })

    if (!res.ok) await handleApiError(res, "Upload failed")
    return res.json()
}

async function deleteAccountFn(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "DELETE",
        credentials: "include",
        headers: mutationHeaders(),
    })

    if (!res.ok) await handleApiError(res, "Account deletion failed")
}

async function setSrcKeyFn(
    data: VerifySrcRequest,
): Promise<SRCKeyStatusResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/me/src-key`, {
        method: "POST",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        if (res.status === 403) {
            throw new Error("You are no longer a moderator.")
        }
        await handleApiError(res, "Failed to store API key")
    }

    return res.json()
}

async function deleteSrcKeyFn(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/me/src-key`, {
        method: "DELETE",
        credentials: "include",
        headers: mutationHeaders(),
    })

    if (!res.ok) {
        if (res.status === 403) {
            throw new Error("You are no longer a moderator.")
        }
        await handleApiError(res, "Failed to remove API key")
    }
}

async function changePasswordFn(
    data: ChangePasswordRequest,
): Promise<void> {
    const res = await fetch(`${ALLAUTH_API_URL}/account/password/change`, {
        method: "POST",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (!res.ok) await handleApiError(res, "Password change failed")
}

export function useAuth() {
    const queryClient = useQueryClient()

    const invalidateAuth = () => {
        queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
    }

    // Session check
    const sessionQuery = useQuery({
        queryKey: ["auth", "session"],
        queryFn: checkSession,
        staleTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: true,
    })

    // Countries list (cached long-term, rarely changes)
    const countriesQuery = useQuery({
        queryKey: ["auth", "countries"],
        queryFn: fetchCountries,
        staleTime: 60 * 60 * 1000,
        enabled: sessionQuery.data?.isAuthenticated ?? false,
    })

    // Player profile (only when authenticated)
    const profileQuery = useQuery({
        queryKey: ["auth", "me"],
        queryFn: fetchProfile,
        enabled: sessionQuery.data?.isAuthenticated ?? false,
        staleTime: 5 * 60 * 1000,
        retry: false,
    })

    const login = useMutation({
        mutationFn: loginFn,
        onSuccess: (result) => {
            if (result.success) {
                invalidateAuth()
            }
        },
    })

    const submitTotp = useMutation({
        mutationFn: submitTotpFn,
        onSuccess: () => invalidateAuth(),
    })

    const logout = useMutation({
        mutationFn: logoutFn,
        onSuccess: () => invalidateAuth(),
    })

    const register = useMutation({
        mutationFn: registerFn,
        onSuccess: () => invalidateAuth(),
    })

    const updateProfile = useMutation({
        mutationFn: updateProfileFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
        },
    })

    const uploadPfp = useMutation({
        mutationFn: uploadPfpFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
        },
    })

    const deleteAccount = useMutation({
        mutationFn: deleteAccountFn,
        onSuccess: () => invalidateAuth(),
    })

    const changePassword = useMutation({
        mutationFn: changePasswordFn,
    })

    const setSrcKey = useMutation({
        mutationFn: setSrcKeyFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
        },
        onError: (error) => {
            if (error.message === "You are no longer a moderator.") {
                queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
            }
        },
    })

    const deleteSrcKey = useMutation({
        mutationFn: deleteSrcKeyFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
        },
        onError: (error) => {
            if (error.message === "You are no longer a moderator.") {
                queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
            }
        },
    })

    return {
        player: profileQuery.data ?? null,
        countries: countriesQuery.data ?? [],
        isAuthenticated: sessionQuery.data?.isAuthenticated ?? false,
        isLoading: sessionQuery.isLoading,
        login,
        submitTotp,
        logout,
        register,
        updateProfile,
        uploadPfp,
        deleteAccount,
        changePassword,
        setSrcKey,
        deleteSrcKey,
    }
}
