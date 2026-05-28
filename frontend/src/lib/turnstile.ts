const RAW_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export const TURNSTILE_SITE_KEY: string = (RAW_KEY ?? "").trim()

export function isTurnstileEnabled(): boolean {
    return TURNSTILE_SITE_KEY.length > 0
}
