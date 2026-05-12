import { apiFetch } from "@/lib/api-client"
import type {
    AdminModeratedGame,
    AdminPfpResponse,
    AwardEntry,
    BanRequest,
    SessionsRevokedResponse,
} from "@/types/admin-users"

const usersBase = (ident: string) =>
    `/auth/admin/users/${encodeURIComponent(ident)}`

export const fetchUserModerates = (
    ident: string,
    signal?: AbortSignal,
): Promise<AdminModeratedGame[]> =>
    apiFetch<AdminModeratedGame[]>(`${usersBase(ident)}/moderates`, { signal })

export const addModeratorFn = (
    ident: string,
    gameId: string,
): Promise<void> =>
    apiFetch<void>(
        `${usersBase(ident)}/moderates/${encodeURIComponent(gameId)}`,
        { method: "POST" },
    )

export const removeModeratorFn = (
    ident: string,
    gameId: string,
): Promise<void> =>
    apiFetch<void>(
        `${usersBase(ident)}/moderates/${encodeURIComponent(gameId)}`,
        { method: "DELETE" },
    )

export const fetchUserAwards = (
    ident: string,
    signal?: AbortSignal,
): Promise<AwardEntry[]> =>
    apiFetch<AwardEntry[]>(`${usersBase(ident)}/awards`, { signal })

export const grantAwardFn = (
    ident: string,
    awardId: number,
): Promise<void> =>
    apiFetch<void>(
        `${usersBase(ident)}/awards/${awardId}`,
        { method: "POST" },
    )

export const revokeAwardFn = (
    ident: string,
    awardId: number,
): Promise<void> =>
    apiFetch<void>(
        `${usersBase(ident)}/awards/${awardId}`,
        { method: "DELETE" },
    )

export const uploadPfpFn = (
    ident: string,
    file: File,
): Promise<AdminPfpResponse> => {
    const body = new FormData()
    body.append("file", file)
    return apiFetch<AdminPfpResponse>(
        `${usersBase(ident)}/pfp`,
        { method: "POST", body },
    )
}

export const deletePfpFn = (ident: string): Promise<void> =>
    apiFetch<void>(`${usersBase(ident)}/pfp`, { method: "DELETE" })

export const revokeSessionsFn = (
    ident: string,
): Promise<SessionsRevokedResponse> =>
    apiFetch<SessionsRevokedResponse>(
        `${usersBase(ident)}/sessions`,
        { method: "DELETE" },
    )

export const forcePasswordResetFn = (ident: string): Promise<void> =>
    apiFetch<void>(
        `${usersBase(ident)}/password-reset`,
        { method: "POST" },
    )

export const banUserFn = (
    ident: string,
    body: BanRequest = {},
): Promise<void> =>
    apiFetch<void>(
        `${usersBase(ident)}/ban`,
        { method: "POST", json: body },
    )

export const unbanUserFn = (ident: string): Promise<void> =>
    apiFetch<void>(`${usersBase(ident)}/ban`, { method: "DELETE" })
