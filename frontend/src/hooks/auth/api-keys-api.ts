import { apiFetch, ApiError } from "@/lib/api-client"
import type {
    ApiKeyResponse,
    ApiKeyCreateResponse,
    ApiKeyCreateRequest,
    ApiKeyPatchRequest,
    CapabilitiesResponse,
} from "@/types/api-keys"

export const listApiKeysFn = (signal?: AbortSignal): Promise<ApiKeyResponse[]> =>
    apiFetch<ApiKeyResponse[]>("/auth/me/api-keys", { signal })

export const createApiKeyFn = (
    data: ApiKeyCreateRequest,
): Promise<ApiKeyCreateResponse> =>
    apiFetch<ApiKeyCreateResponse>(
        "/auth/me/api-keys",
        { method: "POST", json: data },
    )

export const patchApiKeyFn = (
    id: string,
    data: ApiKeyPatchRequest,
): Promise<ApiKeyResponse> =>
    apiFetch<ApiKeyResponse>(
        `/auth/me/api-keys/${id}`,
        { method: "PATCH", json: data },
    )

export const revokeApiKeyFn = (id: string): Promise<void> =>
    apiFetch<void>(
        `/auth/me/api-keys/${id}`,
        { method: "DELETE" },
    )

export const fetchCapabilitiesFn = (
    signal?: AbortSignal,
): Promise<CapabilitiesResponse> =>
    apiFetch<CapabilitiesResponse>("/auth/me/capabilities", { signal })

export function apiKeyErrorMessage(err: unknown): string {
    if (!(err instanceof ApiError)) {
        return "Something went wrong. Try again."
    }
    if (err.isValidation) {
        const body = err.body as { detail?: Array<{ msg?: string }> } | null
        const firstMsg = body?.detail?.[0]?.msg
        if (typeof firstMsg === "string") return firstMsg
    }
    return err.message
}
