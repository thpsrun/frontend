import { apiFetch } from "@/lib/api-client"
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

export const fetchNavbarAdmin = (
    signal?: AbortSignal,
): Promise<NavbarStateResponse> =>
    apiFetch<NavbarStateResponse>(
        "/auth/admin/navbar",
        { signal },
    )

export const createNavItemFn = (
    body: NavItemCreate,
): Promise<NavbarAdminItem> =>
    apiFetch<NavbarAdminItem>(
        "/auth/admin/navbar/items",
        { method: "POST", json: body },
    )

export const updateNavItemFn = (
    itemId: number,
    body: NavItemUpdate,
): Promise<NavbarAdminItem> =>
    apiFetch<NavbarAdminItem>(
        `/auth/admin/navbar/items/${itemId}`,
        { method: "PATCH", json: body },
    )

export const deleteNavItemFn = (itemId: number): Promise<void> =>
    apiFetch<void>(
        `/auth/admin/navbar/items/${itemId}`,
        { method: "DELETE" },
    )

export const reorderNavItemsFn = (
    body: NavItemReorderRequest,
): Promise<void> =>
    apiFetch<void>(
        "/auth/admin/navbar/items/reorder",
        { method: "POST", json: body },
    )

export const createSocialFn = (
    body: SocialLinkCreate,
): Promise<NavbarAdminSocial> =>
    apiFetch<NavbarAdminSocial>(
        "/auth/admin/navbar/social",
        { method: "POST", json: body },
    )

export const updateSocialFn = (
    linkId: number,
    body: SocialLinkUpdate,
): Promise<NavbarAdminSocial> =>
    apiFetch<NavbarAdminSocial>(
        `/auth/admin/navbar/social/${linkId}`,
        { method: "PATCH", json: body },
    )

export const deleteSocialFn = (linkId: number): Promise<void> =>
    apiFetch<void>(
        `/auth/admin/navbar/social/${linkId}`,
        { method: "DELETE" },
    )

export const reorderSocialsFn = (
    body: SocialReorderRequest,
): Promise<void> =>
    apiFetch<void>(
        "/auth/admin/navbar/social/reorder",
        { method: "POST", json: body },
    )
