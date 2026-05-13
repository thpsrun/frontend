export function validateUsername(value: string): string | null {
    if (value.length < 3 || value.length > 20) {
        return "Usernames must be between 3 and 20 characters."
    }
    if (!/^[\w.@+-]+$/.test(value)) {
        return "Username can only contain letters, digits, and @/./+/-/_ characters."
    }
    return null
}

// Printable ASCII range (\x20-\x7E) covers space through tilde;
// control characters and non-ASCII unicode are rejected.
export function validatePassword(value: string): string | null {
    if (value.length < 8 || value.length > 64) {
        return "Password must be 8-64 characters."
    }
    if (!/^[\x20-\x7E]+$/.test(value)) {
        return "Password can only contain printable ASCII characters."
    }
    return null
}

export function validateApiKeyLabel(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
        return "Label is required."
    }
    if (trimmed.length > 100) {
        return "Label must be 100 characters or fewer."
    }
    return null
}

export function validateEmail(value: string): string | null {
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Please enter a valid email address."
    }
    return null
}

export function validateGuideTitle(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) return "Title is required."
    if (trimmed.length > 200) return "Title must be 200 characters or fewer."
    return null
}

export function validateGuideShortDescription(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) return "Short description is required."
    if (trimmed.length > 500) return "Short description must be 500 characters or fewer."
    return null
}

export function validateGuideContent(value: string): string | null {
    if (value.length === 0) return "Content is required."
    if (value.length > 50_000) return "Content must be 50,000 characters or fewer."
    return null
}

export function validateTagName(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) return "Tag name is required."
    if (trimmed.length > 100) return "Tag name must be 100 characters or fewer."
    return null
}

export function validateTagDescription(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) return "Tag description is required."
    if (trimmed.length > 500) return "Tag description must be 500 characters or fewer."
    return null
}

export function validateNavItemName(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) return "Name is required."
    if (trimmed.length > 100) return "Name must be 100 characters or fewer."
    return null
}

// Control characters to remove some potential parsing tricks
const URL_CONTROL_CHARS = /[\x00-\x1F\x7F]/

// Requires HTTP(s) and rejects JavaScript and other crap.
export function validateNavUrl(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) return null
    if (trimmed.length > 500) return "URL must be 500 characters or fewer."
    if (URL_CONTROL_CHARS.test(trimmed)) return "URL contains invalid characters."
    if (trimmed.startsWith("/")) return null
    if (/^https?:\/\//i.test(trimmed)) return null
    return "URL must start with /, http://, or https://."
}

export function validateSocialUrl(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) return "URL is required."
    if (trimmed.length > 500) return "URL must be 500 characters or fewer."
    if (URL_CONTROL_CHARS.test(trimmed)) return "URL contains invalid characters."
    if (!/^https?:\/\//i.test(trimmed)) {
        return "URL must start with http:// or https://."
    }
    return null
}
