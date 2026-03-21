import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_BASE_URL, ALLAUTH_API_URL } from "@/constants"
import type {
    AuthPlayer,
    LoginRequest,
    RegisterRequest,
    VerifySrcRequest,
    VerifySrcResponse,
    RegisterResponse,
    SessionState,
    AllauthSessionResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    PfpResponse,
    Country,
    SRCKeyStatusResponse,
} from "@/types/auth"

// Django has its own CSRF cookie it provides to the user, this will read it when authentication occurs.
function getCsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : ""
}

function mutationHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
    }
}

// Checks the current session and helps normalize the HTTP 200 and 401 requests.
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

// This fun block is how React interacts with Django-Allauth. :)
// I kinda-sorta know what I am doing, but it might be scuffed in some parts.
async function loginFn(data: LoginRequest): Promise<LoginResult> {
    const res = await fetch(`${ALLAUTH_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (res.status === 200) {
        return { success: true, mfaRequired: false, emailVerificationRequired: false }
    }

    // There are different types of Unauthorized requests that the API can send back.
    // For example, MFA not being provided, email is not verified, etc.
    if (res.status === 401) {
        const body: AllauthSessionResponse = await res.json()
        const hasMfa = body.data.flows?.some(
            (f) => f.id === "mfa_authenticate",
        )
        if (hasMfa) {
            return { success: false, mfaRequired: true, emailVerificationRequired: false }
        }
        const emailPending = body.data.flows?.some(
            (f) => f.id === "verify_email" && f.is_pending,
        )
        if (emailPending) {
            return { success: false, mfaRequired: false, emailVerificationRequired: true }
        }
    }

    // Error responses
    if (res.status === 429) {
        throw new Error("Too many attempts. Please wait and try again.")
    }
    const errorBody = await res.json().catch(() => null)
    if (errorBody?.errors?.length) {
        throw new Error(errorBody.errors[0].message)
    }
    throw new Error("Invalid credentials. Please try again.")
}

// TOTP code submission stuff. Still a TODO.
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

// Verify SRC API key
async function verifySrcFn(
    data: VerifySrcRequest,
): Promise<VerifySrcResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/verify-src`, {
        method: "POST",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Too many attempts. Please wait and try again.")
        }
        const errorBody = await res.json().catch(() => null)
        if (errorBody?.error) {
            throw new Error(errorBody.error)
        }
        throw new Error(`Verification failed: ${res.status}`)
    }

    return res.json()
}

// Register account
async function registerFn(
    data: RegisterRequest,
): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Too many attempts. Please wait and try again.")
        }
        if (res.status === 403) {
            throw new Error(
                "SRC verification expired. Please verify your API key again.",
            )
        }
        const errorBody = await res.json().catch(() => null)
        if (errorBody?.error) {
            throw new Error(errorBody.error)
        }
        throw new Error(`Registration failed: ${res.status}`)
    }

    return res.json()
}

// Fetch countries list
async function fetchCountries(): Promise<Country[]> {
    const res = await fetch(`${API_BASE_URL}/auth/countries`, {
        credentials: "include",
    })

    if (!res.ok) {
        throw new Error(`Countries fetch failed: ${res.status}`)
    }

    return res.json()
}

// Update profile fields
async function updateProfileFn(
    data: UpdateProfileRequest,
): Promise<AuthPlayer> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Too many attempts. Please wait and try again.")
        }
        const errorBody = await res.json().catch(() => null)
        if (errorBody?.error) {
            throw new Error(errorBody.error)
        }
        throw new Error(`Update Failed: ${res.status}`)
    }

    return res.json()
}

// Upload profile picture
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

    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Too many attempts. Please wait and try again.")
        }
        const errorBody = await res.json().catch(() => null)
        if (errorBody?.error) {
            throw new Error(errorBody.error)
        }
        throw new Error(`Upload failed: ${res.status}`)
    }

    return res.json()
}

// Delete account
async function deleteAccountFn(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "DELETE",
        credentials: "include",
        headers: mutationHeaders(),
    })

    if (!res.ok) {
        throw new Error(`Account deletion failed: ${res.status}`)
    }
}

// Store SRC API key (moderators only)
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
        if (res.status === 429) {
            throw new Error("Too many attempts. Please wait and try again.")
        }
        if (res.status === 403) {
            throw new Error("You are no longer a moderator.")
        }
        const errorBody = await res.json().catch(() => null)
        if (errorBody?.error) {
            throw new Error(errorBody.error)
        }
        throw new Error(`Failed to store API key: ${res.status}`)
    }

    return res.json()
}

// Remove SRC API key
async function deleteSrcKeyFn(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/me/src-key`, {
        method: "DELETE",
        credentials: "include",
        headers: mutationHeaders(),
    })

    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Too many attempts. Please wait and try again.")
        }
        if (res.status === 403) {
            throw new Error("You are no longer a moderator.")
        }
        throw new Error(`Failed to remove API key: ${res.status}`)
    }
}

// Change password via allauth
async function changePasswordFn(
    data: ChangePasswordRequest,
): Promise<void> {
    const res = await fetch(`${ALLAUTH_API_URL}/account/password/change`, {
        method: "POST",
        credentials: "include",
        headers: mutationHeaders(),
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Too many attempts. Please wait and try again.")
        }
        const errorBody = await res.json().catch(() => null)
        if (errorBody?.errors?.length) {
            throw new Error(errorBody.errors[0].message)
        }
        throw new Error("Password change failed.")
    }
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

    const verifySrc = useMutation({
        mutationFn: verifySrcFn,
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
        verifySrc,
        register,
        updateProfile,
        uploadPfp,
        deleteAccount,
        changePassword,
        setSrcKey,
        deleteSrcKey,
    }
}
