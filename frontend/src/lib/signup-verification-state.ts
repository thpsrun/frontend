const STORAGE_KEY = "thps:signup-verification"

export interface SignupVerificationState {
    email?: string
    username: string
    src_user_id?: string
    provider?: string
}

export function stashSignupVerification(state: SignupVerificationState): void {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        //
    }
}

export function readSignupVerification(): SignupVerificationState | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as unknown
        if (
            typeof parsed === "object"
            && parsed !== null
            && typeof (parsed as SignupVerificationState).username === "string"
        ) {
            return parsed as SignupVerificationState
        }
        return null
    } catch {
        return null
    }
}

export function clearSignupVerification(): void {
    try {
        sessionStorage.removeItem(STORAGE_KEY)
    } catch {
        //
    }
}

export function updateSignupVerificationEmail(newEmail: string): void {
    const current = readSignupVerification()
    if (!current) return
    stashSignupVerification({ ...current, email: newEmail })
}
