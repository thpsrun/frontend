import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/lib/query-keys"
import { getErrorMessage } from "@/lib/utils"
import type {
    AdminModeratedGame,
    AdminPfpResponse,
    AwardEntry,
    SessionsRevokedResponse,
} from "@/types/admin-users"
import {
    addModeratorFn,
    banUserFn,
    deletePfpFn,
    fetchUserAwards,
    fetchUserModerates,
    forcePasswordResetFn,
    grantAwardFn,
    removeModeratorFn,
    revokeAwardFn,
    revokeSessionsFn,
    unbanUserFn,
    uploadPfpFn,
} from "./admin-users-api"

export function useUserModerates(ident: string | undefined) {
    return useQuery({
        queryKey: queryKeys.admin.userModerates(ident ?? ""),
        queryFn: ({ signal }) => fetchUserModerates(ident!, signal),
        enabled: Boolean(ident),
        staleTime: 60 * 1000,
    })
}

export function useUserAwards(ident: string | undefined) {
    return useQuery({
        queryKey: queryKeys.admin.userAwards(ident ?? ""),
        queryFn: ({ signal }) => fetchUserAwards(ident!, signal),
        enabled: Boolean(ident),
        staleTime: 60 * 1000,
    })
}

export function useAddModerator(ident: string, playerName: string) {
    const queryClient = useQueryClient()
    const key = queryKeys.admin.userModerates(ident)

    return useMutation<
        void,
        Error,
        AdminModeratedGame,
        { previous: AdminModeratedGame[] | undefined }
    >({
        mutationFn: (game) => addModeratorFn(ident, game.game_id),
        onMutate: async (game) => {
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<AdminModeratedGame[]>(key)
            if (previous) {
                queryClient.setQueryData<AdminModeratedGame[]>(key, [
                    ...previous.filter((g) => g.game_id !== game.game_id),
                    game,
                ])
            }
            return { previous }
        },
        onError: (err, _game, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(key, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to Add Moderator..."))
        },
        onSuccess: (_data, game) => {
            toast.success(
                `${playerName} added as moderator for ${game.game_name} successfully!`,
            )
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export function useRemoveModerator(ident: string, playerName: string) {
    const queryClient = useQueryClient()
    const key = queryKeys.admin.userModerates(ident)

    return useMutation<
        void,
        Error,
        AdminModeratedGame,
        { previous: AdminModeratedGame[] | undefined }
    >({
        mutationFn: (game) => removeModeratorFn(ident, game.game_id),
        onMutate: async (game) => {
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<AdminModeratedGame[]>(key)
            if (previous) {
                queryClient.setQueryData<AdminModeratedGame[]>(
                    key,
                    previous.filter((g) => g.game_id !== game.game_id),
                )
            }
            return { previous }
        },
        onError: (err, _game, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(key, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to Remove Moderator..."))
        },
        onSuccess: (_data, game) => {
            toast.success(
                `${playerName} removed as moderator for ${game.game_name} successfully!`,
            )
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export function useGrantAward(ident: string, playerName: string) {
    const queryClient = useQueryClient()
    const key = queryKeys.admin.userAwards(ident)

    return useMutation<
        void,
        Error,
        AwardEntry,
        { previous: AwardEntry[] | undefined }
    >({
        mutationFn: (award) => grantAwardFn(ident, award.award_id),
        onMutate: async (award) => {
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<AwardEntry[]>(key)
            if (previous) {
                queryClient.setQueryData<AwardEntry[]>(key, [
                    ...previous.filter((a) => a.award_id !== award.award_id),
                    award,
                ])
            }
            return { previous }
        },
        onError: (err, _award, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(key, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to Grant Award..."))
        },
        onSuccess: (_data, award) => {
            toast.success(
                `${playerName} granted ${award.award_name} successfully!`,
            )
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export function useRevokeAward(ident: string, playerName: string) {
    const queryClient = useQueryClient()
    const key = queryKeys.admin.userAwards(ident)

    return useMutation<
        void,
        Error,
        AwardEntry,
        { previous: AwardEntry[] | undefined }
    >({
        mutationFn: (award) => revokeAwardFn(ident, award.award_id),
        onMutate: async (award) => {
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<AwardEntry[]>(key)
            if (previous) {
                queryClient.setQueryData<AwardEntry[]>(
                    key,
                    previous.filter((a) => a.award_id !== award.award_id),
                )
            }
            return { previous }
        },
        onError: (err, _award, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(key, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to Revoke Award..."))
        },
        onSuccess: (_data, award) => {
            toast.success(
                `${award.award_name} revoked from ${playerName} successfully!`,
            )
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export function useUploadPfp(ident: string) {
    const queryClient = useQueryClient()
    return useMutation<AdminPfpResponse, Error, File>({
        mutationFn: (file) => uploadPfpFn(ident, file),
        onSuccess: () => {
            toast.success("Profile picture uploaded!")
            queryClient.invalidateQueries({
                queryKey: queryKeys.player.profilePrefix(ident),
            })
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to Upload Picture..."))
        },
    })
}

export function useDeletePfp(ident: string) {
    const queryClient = useQueryClient()
    return useMutation<void, Error, void>({
        mutationFn: () => deletePfpFn(ident),
        onSuccess: () => {
            toast.success("Profile picture removed.")
            queryClient.invalidateQueries({
                queryKey: queryKeys.player.profilePrefix(ident),
            })
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to Delete Picture..."))
        },
    })
}

export function useRevokeSessions(ident: string) {
    return useMutation<SessionsRevokedResponse, Error, void>({
        mutationFn: () => revokeSessionsFn(ident),
        onSuccess: (data) => {
            toast.success(`Revoked ${data.revoked} session(s).`)
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to Revoke Sessions..."))
        },
    })
}

export function useForcePasswordReset(ident: string) {
    return useMutation<void, Error, void>({
        mutationFn: () => forcePasswordResetFn(ident),
        onSuccess: () => {
            toast.success("Password reset initiated.")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to Force Password Reset..."))
        },
    })
}

export function useBanUser(ident: string) {
    return useMutation<void, Error, void>({
        mutationFn: () => banUserFn(ident, {}),
        onSuccess: () => {
            toast.success("User banned.")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to Ban User..."))
        },
    })
}

export function useUnbanUser(ident: string) {
    return useMutation<void, Error, void>({
        mutationFn: () => unbanUserFn(ident),
        onSuccess: () => {
            toast.success("User unbanned.")
        },
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to Unban User..."))
        },
    })
}
