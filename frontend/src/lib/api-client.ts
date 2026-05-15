import { API_BASE_URL, ALLAUTH_API_URL } from "@/constants"

type ApiBase = "api" | "allauth"

type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
    base?: ApiBase
    json?: unknown
    body?: BodyInit | null
    headers?: HeadersInit
    signal?: AbortSignal
}

export class ApiError extends Error {
    readonly status: number
    readonly code: string | null
    readonly body: unknown

    constructor(status: number, message: string, code: string | null, body: unknown) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.code = code
        this.body = body
    }

    get isAuthRequired(): boolean {
        return this.status === 401
    }

    get isForbidden(): boolean {
        return this.status === 403
    }

    get isRateLimited(): boolean {
        return this.status === 429
    }
}

type AuthLostHandler = () => void
let authLostHandler: AuthLostHandler | null = null
let bannedRedirected = false

const BANNED_DETAIL = "Account disabled"

export function setAuthLostHandler(handler: AuthLostHandler | null): void {
    authLostHandler = handler
}

export function getCsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : ""
}

function resolveBase(base: ApiBase): string {
    return base === "allauth" ? ALLAUTH_API_URL : API_BASE_URL
}

function isMutation(method: string | undefined): boolean {
    if (!method) return false
    const m = method.toUpperCase()
    return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE"
}

function buildHeaders(
    init: HeadersInit | undefined,
    hasJsonBody: boolean,
    needsCsrf: boolean,
): Headers {
    const headers = new Headers(init)
    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json")
    }
    if (hasJsonBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json")
    }
    if (needsCsrf && !headers.has("X-CSRFToken")) {
        headers.set("X-CSRFToken", getCsrfToken())
    }
    return headers
}

async function parseError(res: Response): Promise<ApiError> {
    if (res.status === 429) {
        return new ApiError(429, "Too many attempts. Please wait and try again.", "rate_limited", null)
    }
    const body = await res.json().catch(() => null)
    const code = typeof body?.code === "string" ? body.code : null
    const message = typeof body?.error === "string"
        ? body.error
        : typeof body?.detail === "string"
            ? body.detail
            : typeof body?.errors?.[0]?.message === "string"
                ? body.errors[0].message
                : `Request failed: ${res.status}`
    return new ApiError(res.status, message, code, body)
}

export async function apiFetch<T = unknown>(
    path: string,
    options: ApiFetchOptions = {},
): Promise<T> {
    const { base = "api", json, body, headers, signal, method, ...rest } = options

    const mutation = isMutation(method)
    const hasJsonBody = json !== undefined
    const finalHeaders = buildHeaders(headers, hasJsonBody, mutation)

    const url = path.startsWith("http") ? path : `${resolveBase(base)}${path}`

    const res = await fetch(url, {
        ...rest,
        method,
        credentials: "include",
        headers: finalHeaders,
        body: hasJsonBody ? JSON.stringify(json) : body,
        signal,
    })

    if (!res.ok) {
        const error = await parseError(res)
        if (
            error.status === 403
            && (error.body as { detail?: unknown } | null)?.detail === BANNED_DETAIL
        ) {
            if (!bannedRedirected) {
                bannedRedirected = true
                window.location.assign("/login/banned")
            }
        } else if (error.status === 401 && base === "api" && authLostHandler) {
            authLostHandler()
        }
        throw error
    }

    if (res.status === 204) {
        return undefined as T
    }
    return res.json() as Promise<T>
}
