import { apiFetch } from "@/lib/api-client"
import type { RecoveryCodesGenerated } from "@/types/auth"

interface DataEnvelope<T> {
    data: T
}

export async function generateRecoveryCodes(): Promise<RecoveryCodesGenerated> {
    const res = await apiFetch<DataEnvelope<RecoveryCodesGenerated>>(
        "/account/authenticators/recovery-codes",
        { base: "allauth", method: "POST" },
    )
    return res.data
}
