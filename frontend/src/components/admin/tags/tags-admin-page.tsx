import { useState } from "react"
import { Plus, Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"
import { Panel } from "@/components/ui/panel"
import { useTags } from "@/hooks/guides/useTags"
import type { Tag } from "@/types/guides"
import { TagsTable } from "./tags-table"
import { TagFormDialog } from "./tag-form-dialog"
import { DeleteTagDialog } from "./delete-tag-dialog"

export function TagsAdminPage() {
    const { data, isLoading } = useTags()
    const [editing, setEditing] = useState<Tag | null>(null)
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState<Tag | null>(null)

    return (
        <div className="space-y-4">
            <Panel>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Tags</h2>
                        <p className="text-sm text-muted-foreground">
                            Tags are applied to guides and are globally-accessible.
                        </p>
                    </div>
                    <Button onClick={() => setCreating(true)}>
                        <Plus className="mr-2 size-4" />New tag
                    </Button>
                </div>
            </Panel>

            {isLoading
                ? <Panel className="p-10 text-center text-muted-foreground">Loading...</Panel>
                : (data?.length ?? 0) === 0
                    ? <EmptyState icon={TagIcon} title="No tags yet." />
                    : (
                        <TagsTable
                            tags={data ?? []}
                            onEdit={setEditing}
                            onDelete={setDeleting}
                        />
                    )}

            <TagFormDialog
                mode={editing ? "edit" : "create"}
                tag={editing}
                open={creating || !!editing}
                onOpenChange={(v) => {
                    if (!v) {
                        setCreating(false)
                        setEditing(null)
                    }
                }}
            />

            <DeleteTagDialog
                tag={deleting}
                open={!!deleting}
                onOpenChange={(v) => { if (!v) setDeleting(null) }}
            />
        </div>
    )
}
