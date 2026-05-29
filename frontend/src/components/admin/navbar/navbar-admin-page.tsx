import { useState } from "react"
import { Inbox, Plus, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"
import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/common/query-error-banner"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
    useNavbarAdmin,
    useReorderNavItems,
    useReorderSocials,
    useUpdateNavItem,
    useUpdateSocial,
} from "@/hooks/admin/useNavbarAdmin"
import type {
    NavbarAdminItem,
    NavbarAdminSocial,
} from "@/types/admin-navbar"

import { NavTreeGroup } from "./nav-tree-section"
import { NavItemFormDialog } from "./nav-item-form-dialog"
import { DeleteNavItemDialog } from "./delete-nav-item-dialog"
import { SocialSection } from "./social-section"
import { SocialFormDialog } from "./social-form-dialog"
import { DeleteSocialDialog } from "./delete-social-dialog"

type NavDialog =
    | { kind: "none" }
    | { kind: "create"; defaultParentId: number | null }
    | { kind: "edit"; item: NavbarAdminItem }
    | { kind: "delete"; item: NavbarAdminItem }

type SocialDialog =
    | { kind: "none" }
    | { kind: "create" }
    | { kind: "edit"; link: NavbarAdminSocial }
    | { kind: "delete"; link: NavbarAdminSocial }

export function NavbarAdminPage() {
    const query = useNavbarAdmin()
    const updateItem = useUpdateNavItem()
    const updateSocial = useUpdateSocial()
    const reorderItems = useReorderNavItems()
    const reorderSocials = useReorderSocials()

    const [navDialog, setNavDialog] = useState<NavDialog>({ kind: "none" })
    const [socialDialog, setSocialDialog] = useState<SocialDialog>({
        kind: "none",
    })

    const handleToggleItemVisible = (
        item: NavbarAdminItem,
        value: boolean,
    ) => {
        updateItem.mutate({
            itemId: item.id,
            body: { is_visible: value },
            silent: true,
        })
    }

    const handleToggleSocialVisible = (
        link: NavbarAdminSocial,
        value: boolean,
    ) => {
        updateSocial.mutate({
            linkId: link.id,
            body: { is_visible: value },
            silent: true,
        })
    }

    const handleReorderItems = (
        parentId: number | null,
        orderedIds: number[],
    ) => {
        reorderItems.mutate({ parent_id: parentId, ordered_ids: orderedIds })
    }

    const handleReorderSocials = (orderedIds: number[]) => {
        reorderSocials.mutate({ ordered_ids: orderedIds })
    }

    const data = query.data

    return (
        <div className="space-y-4">
            <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">Navbar</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage the navbar menu and social links. Drag to reorder, toggle to show or hide,
                            and click edit to rename or change a link's URL.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => query.refetch()}
                        disabled={query.isFetching}
                    >
                        <RefreshCw
                            className={cn(
                                "size-4",
                                query.isFetching && "animate-spin",
                            )}
                        />
                        Refresh
                    </Button>
                </div>
            </Panel>

            {query.error && (
                <QueryErrorBanner
                    error={query.error}
                    onRetry={query.refetch}
                />
            )}

            {query.isLoading && (
                <Panel className="p-5 space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </Panel>
            )}

            {data && (
                <>
                    <Panel className="p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold">
                                    Nav items
                                </h3>
                            </div>
                            <Button
                                size="sm"
                                onClick={() =>
                                    setNavDialog({
                                        kind: "create",
                                        defaultParentId: null,
                                    })
                                }
                                className="gap-1"
                            >
                                <Plus className="size-4" /> New Item
                            </Button>
                        </div>

                        {data.items.length === 0 ? (
                            <EmptyState
                                inset
                                icon={Inbox}
                                title="No navbar items yet..."
                            />
                        ) : (
                            <NavTreeGroup
                                items={data.items}
                                parentId={null}
                                depth={0}
                                onEdit={(item) =>
                                    setNavDialog({ kind: "edit", item })
                                }
                                onDelete={(item) =>
                                    setNavDialog({ kind: "delete", item })
                                }
                                onAddChild={(parent) =>
                                    setNavDialog({
                                        kind: "create",
                                        defaultParentId: parent.id,
                                    })
                                }
                                onToggleVisible={handleToggleItemVisible}
                                onReorder={handleReorderItems}
                                pendingItemId={updateItem.isPending ? updateItem.variables?.itemId ?? null : null}
                            />
                        )}
                    </Panel>

                    <SocialSection
                        socials={data.social}
                        onCreate={() => setSocialDialog({ kind: "create" })}
                        onEdit={(link) =>
                            setSocialDialog({ kind: "edit", link })
                        }
                        onDelete={(link) =>
                            setSocialDialog({ kind: "delete", link })
                        }
                        onToggleVisible={handleToggleSocialVisible}
                        onReorder={handleReorderSocials}
                        pendingId={updateSocial.isPending ? updateSocial.variables?.linkId ?? null : null}
                    />

                    <NavItemFormDialog
                        open={navDialog.kind === "create" || navDialog.kind === "edit"}
                        onOpenChange={(v) => {
                            if (!v) setNavDialog({ kind: "none" })
                        }}
                        mode={navDialog.kind === "edit" ? "edit" : "create"}
                        item={navDialog.kind === "edit" ? navDialog.item : null}
                        defaultParentId={
                            navDialog.kind === "create"
                                ? navDialog.defaultParentId
                                : null
                        }
                        items={data.items}
                    />

                    <DeleteNavItemDialog
                        open={navDialog.kind === "delete"}
                        onOpenChange={(v) => {
                            if (!v) setNavDialog({ kind: "none" })
                        }}
                        item={navDialog.kind === "delete" ? navDialog.item : null}
                    />

                    <SocialFormDialog
                        open={
                            socialDialog.kind === "create"
                            || socialDialog.kind === "edit"
                        }
                        onOpenChange={(v) => {
                            if (!v) setSocialDialog({ kind: "none" })
                        }}
                        mode={socialDialog.kind === "edit" ? "edit" : "create"}
                        link={
                            socialDialog.kind === "edit"
                                ? socialDialog.link
                                : null
                        }
                        existingPlatforms={data.social.map((s) => s.platform)}
                    />

                    <DeleteSocialDialog
                        open={socialDialog.kind === "delete"}
                        onOpenChange={(v) => {
                            if (!v) setSocialDialog({ kind: "none" })
                        }}
                        link={
                            socialDialog.kind === "delete"
                                ? socialDialog.link
                                : null
                        }
                    />
                </>
            )}
        </div>
    )
}
