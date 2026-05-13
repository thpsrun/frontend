import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { queryKeys } from "@/lib/query-keys"
import { reorderArrayByIds } from "@/lib/reorder-utils"
import { getErrorMessage } from "@/lib/utils"
import type {
    NavbarAdminItem,
    NavbarAdminSocial,
    NavbarStateResponse,
    NavItemCreate,
    NavItemReorderRequest,
    NavItemUpdate,
    SocialLinkCreate,
    SocialLinkUpdate,
    SocialReorderRequest,
} from "@/types/admin-navbar"
import {
    createNavItemFn,
    createSocialFn,
    deleteNavItemFn,
    deleteSocialFn,
    fetchNavbarAdmin,
    reorderNavItemsFn,
    reorderSocialsFn,
    updateNavItemFn,
    updateSocialFn,
} from "./navbar-admin-api"

const ADMIN_KEY = queryKeys.admin.navbar()
const HOME_KEY = queryKeys.home.navbar()

function invalidateAll(qc: ReturnType<typeof useQueryClient>): void {
    qc.invalidateQueries({ queryKey: ADMIN_KEY })
    qc.invalidateQueries({ queryKey: HOME_KEY })
}

function mapTree(
    items: NavbarAdminItem[],
    fn: (item: NavbarAdminItem) => NavbarAdminItem,
): NavbarAdminItem[] {
    return items.map((item) => {
        const next = fn(item)
        if (next.children.length === 0) return next
        return { ...next, children: mapTree(next.children, fn) }
    })
}

function reorderSiblingsAt(
    items: NavbarAdminItem[],
    parentId: number | null,
    orderedIds: number[],
): NavbarAdminItem[] {
    if (parentId === null) {
        return reorderArrayByIds(items, orderedIds)
    }
    return mapTree(items, (item) => {
        if (item.id !== parentId) return item
        return {
            ...item,
            children: reorderArrayByIds(item.children, orderedIds),
        }
    })
}

export function useNavbarAdmin() {
    return useQuery({
        queryKey: ADMIN_KEY,
        queryFn: ({ signal }) => fetchNavbarAdmin(signal),
        staleTime: 30 * 1000,
    })
}

export function useCreateNavItem() {
    const qc = useQueryClient()
    return useMutation<NavbarAdminItem, Error, NavItemCreate>({
        mutationFn: (body) => createNavItemFn(body),
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to Create Navbar Item..."))
        },
        onSuccess: () => {
            toast.success("Navbar Item Created!")
            invalidateAll(qc)
        },
    })
}

export function useUpdateNavItem() {
    const qc = useQueryClient()
    return useMutation<
        NavbarAdminItem,
        Error,
        { itemId: number; body: NavItemUpdate; silent?: boolean },
        { previous: NavbarStateResponse | undefined }
    >({
        mutationFn: ({ itemId, body }) => updateNavItemFn(itemId, body),
        onMutate: async ({ itemId, body }) => {
            await qc.cancelQueries({ queryKey: ADMIN_KEY })
            const previous = qc.getQueryData<NavbarStateResponse>(ADMIN_KEY)
            if (previous) {
                qc.setQueryData<NavbarStateResponse>(ADMIN_KEY, {
                    ...previous,
                    items: mapTree(previous.items, (item) =>
                        item.id === itemId ? { ...item, ...body } : item,
                    ),
                })
            }
            return { previous }
        },
        onError: (err, _vars, ctx) => {
            if (ctx?.previous) qc.setQueryData(ADMIN_KEY, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to Update Navbar Item..."))
        },
        onSuccess: (_data, vars) => {
            if (!vars.silent) toast.success("Navbar Item Updated!")
        },
        onSettled: () => {
            invalidateAll(qc)
        },
    })
}

export function useDeleteNavItem() {
    const qc = useQueryClient()
    return useMutation<void, Error, number>({
        mutationFn: (itemId) => deleteNavItemFn(itemId),
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to Delete Navbar Item..."))
        },
        onSuccess: () => {
            toast.success("Navbar Item Deleted!")
            invalidateAll(qc)
        },
    })
}

export function useReorderNavItems() {
    const qc = useQueryClient()
    return useMutation<
        void,
        Error,
        NavItemReorderRequest,
        { previous: NavbarStateResponse | undefined }
    >({
        mutationFn: (body) => reorderNavItemsFn(body),
        onMutate: async (body) => {
            await qc.cancelQueries({ queryKey: ADMIN_KEY })
            const previous = qc.getQueryData<NavbarStateResponse>(ADMIN_KEY)
            if (previous) {
                qc.setQueryData<NavbarStateResponse>(ADMIN_KEY, {
                    ...previous,
                    items: reorderSiblingsAt(
                        previous.items,
                        body.parent_id,
                        body.ordered_ids,
                    ),
                })
            }
            return { previous }
        },
        onError: (err, _body, ctx) => {
            if (ctx?.previous) qc.setQueryData(ADMIN_KEY, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to Save Order..."))
        },
        onSettled: () => {
            invalidateAll(qc)
        },
    })
}

export function useCreateSocial() {
    const qc = useQueryClient()
    return useMutation<NavbarAdminSocial, Error, SocialLinkCreate>({
        mutationFn: (body) => createSocialFn(body),
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to Create Social Link..."))
        },
        onSuccess: () => {
            toast.success("Social Link Created!")
            invalidateAll(qc)
        },
    })
}

export function useUpdateSocial() {
    const qc = useQueryClient()
    return useMutation<
        NavbarAdminSocial,
        Error,
        { linkId: number; body: SocialLinkUpdate; silent?: boolean },
        { previous: NavbarStateResponse | undefined }
    >({
        mutationFn: ({ linkId, body }) => updateSocialFn(linkId, body),
        onMutate: async ({ linkId, body }) => {
            await qc.cancelQueries({ queryKey: ADMIN_KEY })
            const previous = qc.getQueryData<NavbarStateResponse>(ADMIN_KEY)
            if (previous) {
                qc.setQueryData<NavbarStateResponse>(ADMIN_KEY, {
                    ...previous,
                    social: previous.social.map((s) =>
                        s.id === linkId ? { ...s, ...body } : s,
                    ),
                })
            }
            return { previous }
        },
        onError: (err, _vars, ctx) => {
            if (ctx?.previous) qc.setQueryData(ADMIN_KEY, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to Update Social Link..."))
        },
        onSuccess: (_data, vars) => {
            if (!vars.silent) toast.success("Social Link Updated!")
        },
        onSettled: () => {
            invalidateAll(qc)
        },
    })
}

export function useDeleteSocial() {
    const qc = useQueryClient()
    return useMutation<void, Error, number>({
        mutationFn: (linkId) => deleteSocialFn(linkId),
        onError: (err) => {
            toast.error(getErrorMessage(err, "Failed to delete social link."))
        },
        onSuccess: () => {
            toast.success("Social link deleted.")
            invalidateAll(qc)
        },
    })
}

export function useReorderSocials() {
    const qc = useQueryClient()
    return useMutation<
        void,
        Error,
        SocialReorderRequest,
        { previous: NavbarStateResponse | undefined }
    >({
        mutationFn: (body) => reorderSocialsFn(body),
        onMutate: async (body) => {
            await qc.cancelQueries({ queryKey: ADMIN_KEY })
            const previous = qc.getQueryData<NavbarStateResponse>(ADMIN_KEY)
            if (previous) {
                qc.setQueryData<NavbarStateResponse>(ADMIN_KEY, {
                    ...previous,
                    social: reorderArrayByIds(previous.social, body.ordered_ids),
                })
            }
            return { previous }
        },
        onError: (err, _body, ctx) => {
            if (ctx?.previous) qc.setQueryData(ADMIN_KEY, ctx.previous)
            toast.error(getErrorMessage(err, "Failed to save order."))
        },
        onSettled: () => {
            invalidateAll(qc)
        },
    })
}
