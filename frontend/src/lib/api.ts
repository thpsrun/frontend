export function getCsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : ""
}

export function mutationHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
    }
}

export async function handleApiError(
    res: Response,
    fallbackMsg: string,
): Promise<never> {
    if (res.status === 429) {
        throw new Error("Too many attempts. Please wait and try again.")
    }
    const body = await res.json().catch(() => null)
    if (body?.error) {
        throw new Error(body.error)
    }
    if (body?.errors?.length) {
        throw new Error(body.errors[0].message)
    }
    throw new Error(`${fallbackMsg}: ${res.status}`)
}
