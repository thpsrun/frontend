import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
        <div className="container mx-auto max-w-4xl px-4 py-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Tags</h1>
                    <p className="text-sm text-muted-foreground">
                        Tags can be applied to guides. Tags are global across all games.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}>
                    <Plus className="mr-2 size-4" />New tag
                </Button>
            </div>

            {isLoading
                ? <Panel className="p-10 text-center text-muted-foreground">Loading...</Panel>
                : (data?.length ?? 0) === 0
                    ? <Panel className="p-10 text-center text-muted-foreground">No tags yet.</Panel>
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
