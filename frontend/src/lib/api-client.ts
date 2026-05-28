import { API_BASE_URL, ALLAUTH_API_URL } from "@/constants"

type ApiBase = "api" | "allauth"

type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
    base?: ApiBase
    json?: unknown
    body?: BodyInit | null
    headers?: HeadersInit
    signal?: AbortSignal
    rememberMe?: boolean
    turnstileToken?: string | null
}

export class ApiError extends Error {
    readonly status: number
    readonly code: string | null
    readonly body: unknown
    readonly retryAfter: number | null

    constructor(
        status: number,
        message: string,
        code: string | null,
        body: unknown,
        retryAfter: number | null = null,
    ) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.code = code
        this.body = body
        this.retryAfter = retryAfter
    }

    get isAuthRequired(): boolean {
        return this.status === 401
    }

    get isForbidden(): boolean {
        return this.status === 403
    }

    get isNotFound(): boolean {
        return this.status === 404
    }

    get isConflict(): boolean {
        return this.status === 409
    }

    get isValidation(): boolean {
        return this.status === 422
    }

    get isRateLimited(): boolean {
        return this.status === 429
    }

    get isClientError(): boolean {
        return this.status >= 400 && this.status < 500
    }

    get isServerError(): boolean {
        return this.status >= 500
    }
}

type AuthLostHandler = () => void
type BannedHandler = () => void
let authLostHandler: AuthLostHandler | null = null
let bannedHandler: BannedHandler | null = null

const BANNED_DETAIL = "Account disabled"

export function setAuthLostHandler(handler: AuthLostHandler | null): void {
    authLostHandler = handler
}

export function setBannedHandler(handler: BannedHandler | null): void {
    bannedHandler = handler
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
    rememberMe: boolean,
    turnstileToken: string | null,
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
    if (rememberMe && !headers.has("X-Remember-Me")) {
        headers.set("X-Remember-Me", "1")
    }
    if (turnstileToken && !headers.has("X-Turnstile-Token")) {
        headers.set("X-Turnstile-Token", turnstileToken)
    }
    return headers
}

function parseRetryAfter(header: string | null): number | null {
    if (!header) return null
    const n = Number(header)
    if (Number.isFinite(n) && n >= 0) return Math.round(n)
    const httpDate = Date.parse(header)
    if (!Number.isNaN(httpDate)) {
        const diff = Math.ceil((httpDate - Date.now()) / 1000)
        return diff > 0 ? diff : 0
    }
    return null
}

async function parseError(res: Response): Promise<ApiError> {
    const retryAfter = parseRetryAfter(res.headers.get("Retry-After"))
    const body = await res.json().catch(() => null)
    // Backend ErrorResponse uses `error` for the slug (e.g. "reauth_required").
    // Allauth and the 429 envelope use `errors[0].code` (e.g. "rate_limited",
    // "turnstile_required"). Prefer an explicit `code`, then fall back to
    // `error`, then to the first allauth/rate-limit error.
    const code = typeof body?.code === "string"
        ? body.code
        : typeof body?.error === "string"
            ? body.error
            : typeof body?.errors?.[0]?.code === "string"
                ? body.errors[0].code
                : null
    const message = typeof body?.error === "string"
        ? body.error
        : typeof body?.detail === "string"
            ? body.detail
            : typeof body?.errors?.[0]?.message === "string"
                ? body.errors[0].message
                : `Request failed: ${res.status}`
    if (res.status === 429) {
        const rateMessage = typeof body?.errors?.[0]?.message === "string"
            ? body.errors[0].message
            : "Too many attempts. Please wait and try again."
        return new ApiError(
            429,
            rateMessage,
            code ?? "rate_limited",
            body,
            retryAfter,
        )
    }
    return new ApiError(res.status, message, code, body, retryAfter)
}

export async function apiFetch<T = unknown>(
    path: string,
    options: ApiFetchOptions = {},
): Promise<T> {
    const {
        base = "api",
        json,
        body,
        headers,
        signal,
        method,
        rememberMe = false,
        turnstileToken = null,
        ...rest
    } = options

    const mutation = isMutation(method)
    const hasJsonBody = json !== undefined
    const finalHeaders = buildHeaders(
        headers,
        hasJsonBody,
        mutation,
        rememberMe,
        turnstileToken,
    )

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
            bannedHandler?.()
        } else if (
            error.status === 401
            && base === "api"
            && error.code !== "reauth_required"
            && authLostHandler
        ) {
            authLostHandler()
        }
        throw error
    }

    if (res.status === 204) {
        return undefined as T
    }
    return res.json() as Promise<T>
}
