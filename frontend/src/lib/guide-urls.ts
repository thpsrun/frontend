import type { Tag } from "@/types/guides"

interface GuideUrlInput {
    slug: string
    game?: { slug: string } | null
}

export function buildGuideUrl(guide: GuideUrlInput): string {
    if (guide.game?.slug) {
        return `/guides/${guide.game.slug}/${guide.slug}`
    }
    return `/guides/${guide.slug}`
}

export function buildGuideEditUrl(guide: GuideUrlInput): string {
    return `${buildGuideUrl(guide)}/edit`
}

export function resolveGuideTags(
    rawTags: unknown,
    master: Tag[] | undefined,
): Tag[] {
    if (!Array.isArray(rawTags)) return []
    const list = master ?? []
    const byId = new Map<number, Tag>()
    const bySlug = new Map<string, Tag>()
    for (const m of list) {
        if (m.id !== undefined && m.id !== null) byId.set(m.id, m)
        if (m.slug) bySlug.set(m.slug, m)
    }
    const out: Tag[] = []
    for (const t of rawTags) {
        if (t === null || t === undefined) continue
        if (typeof t === "string") {
            const found = bySlug.get(t)
            if (found) out.push(found)
            else out.push({ name: t, slug: t, description: "" })
            continue
        }
        if (typeof t === "number") {
            const found = byId.get(t)
            if (found) out.push(found)
            continue
        }
        if (typeof t === "object") {
            const obj = t as {
                id?: number
                name?: string
                slug?: string
                description?: string
            }
            if (obj.slug && obj.name) {
                out.push({
                    id: obj.id,
                    name: obj.name,
                    slug: obj.slug,
                    description: obj.description ?? "",
                })
                continue
            }
            if (obj.slug) {
                const found = bySlug.get(obj.slug)
                if (found) {
                    out.push(found)
                    continue
                }
            }
            if (obj.id !== undefined && obj.id !== null) {
                const found = byId.get(obj.id)
                if (found) {
                    out.push(found)
                    continue
                }
            }
            if (obj.name) {
                const found = list.find((m) => m.name === obj.name)
                if (found) out.push(found)
            }
        }
    }
    return out
}
