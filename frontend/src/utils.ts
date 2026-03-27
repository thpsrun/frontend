// Basic slugify tailored to backend expectations
// (spaces -> "-", "+" -> "plus", "&" -> "and", remove non-alphanum/-)
export function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/\+/g, " plus ")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
}

// Reverse slug (best effort)
export function unslugify(slug: string): string {
    return slug
        .replace(/-/g, " ")
        .replace(/\bplus\b/g, "+")
        .replace(/\band\b/g, "&")
}
