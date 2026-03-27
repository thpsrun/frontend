export function validateUsername(value: string): string | null {
    if (value.length < 3 || value.length > 20) {
        return "Username must be 3-20 characters."
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
