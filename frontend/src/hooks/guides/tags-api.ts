import { apiFetch } from "@/lib/api-client"
import type {
    Tag,
    TagCreateInput,
    TagUpdateInput,
} from "@/types/guides"

export const listTagsFn = (signal?: AbortSignal): Promise<Tag[]> =>
    apiFetch<Tag[]>("/tags/all", { signal })

export const createTagFn = (data: TagCreateInput): Promise<Tag> =>
    apiFetch<Tag>("/tags/", { method: "POST", json: data })

export const updateTagFn = (
    slug: string,
    data: TagUpdateInput,
): Promise<Tag> =>
    apiFetch<Tag>(`/tags/${encodeURIComponent(slug)}`, {
        method: "PUT",
        json: data,
    })

export const deleteTagFn = (slug: string): Promise<void> =>
    apiFetch<void>(`/tags/${encodeURIComponent(slug)}`, { method: "DELETE" })
