import { apiFetch, ApiError } from "@/lib/api-client"
import type { TotpSetup } from "@/types/auth"

interface TotpMetaBody {
    meta?: {
        secret?: string
        totp_url?: string
    }
}

// Returns 404 when TOTP is not yet active. That 404 IS the setup payload, not an error cause I'm dumb.
export async function getTotpSetup(signal?: AbortSignal): Promise<TotpSetup> {
    try {
        await apiFetch("/account/authenticators/totp", { base: "allauth", signal })
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
            const body = err.body as TotpMetaBody | null
            const secret = body?.meta?.secret
            const totpUrl = body?.meta?.totp_url
            if (secret && totpUrl) {
                return { secret, totpUrl }
            }
            throw new Error("Couldn't load authenticator setup data.", { cause: err })
        }
        throw err
    }
    throw new Error("Authenticator app is already set up.")
}

export async function activateTotp(code: string): Promise<void> {
    await apiFetch("/account/authenticators/totp", {
        base: "allauth",
        method: "POST",
        json: { code },
    })
}

export async function deactivateTotp(): Promise<void> {
    await apiFetch("/account/authenticators/totp", {
        base: "allauth",
        method: "DELETE",
    })
}
