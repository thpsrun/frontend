import type {
    AuthenticationResponseJSON,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
} from "@simplewebauthn/browser"
import { apiFetch } from "@/lib/api-client"
import type { Authenticator, PasskeyLoginOptions } from "@/types/auth"

interface DataEnvelope<T> { data: T }

export async function getPasskeyLoginOptions(
    signal?: AbortSignal,
): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const res = await apiFetch<DataEnvelope<{
        request_options: { publicKey: PublicKeyCredentialRequestOptionsJSON }
    }>>(
        "/auth/webauthn/login",
        { base: "allauth", signal },
    )
    return res.data.request_options.publicKey
}

export async function completePasskeyLogin(
    credential: AuthenticationResponseJSON,
    options: PasskeyLoginOptions = { rememberMe: false },
): Promise<void> {
    await apiFetch("/auth/webauthn/login", {
        base: "allauth",
        method: "POST",
        json: { credential },
        rememberMe: options.rememberMe,
    })
}

export async function listAuthenticators(
    signal?: AbortSignal,
): Promise<Authenticator[]> {
    const res = await apiFetch<DataEnvelope<Authenticator[]>>(
        "/account/authenticators",
        { base: "allauth", signal },
    )
    return res.data
}

export async function getPasskeyEnrollOptions(
    signal?: AbortSignal,
): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const res = await apiFetch<DataEnvelope<{
        creation_options: { publicKey: PublicKeyCredentialCreationOptionsJSON }
    }>>(
        "/account/authenticators/webauthn?passwordless",
        { base: "allauth", signal },
    )
    return res.data.creation_options.publicKey
}

export async function enrollPasskey(
    name: string,
    credential: RegistrationResponseJSON,
): Promise<void> {
    await apiFetch("/account/authenticators/webauthn", {
        base: "allauth",
        method: "POST",
        json: { name, credential },
    })
}

export async function deletePasskey(id: string): Promise<void> {
    await apiFetch("/account/authenticators/webauthn", {
        base: "allauth",
        method: "DELETE",
        json: { authenticators: [id] },
    })
}
