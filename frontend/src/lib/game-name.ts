const SHORT_NAME_OVERRIDES: Record<string, string> = {
    thps12: "THPS1+2",
    thps12ce: "THPS1+2CE",
    thps34: "THPS3+4",
    thps34ce: "THPS3+4CE",
}

export const gameShortName = (slug: string): string =>
    SHORT_NAME_OVERRIDES[slug.toLowerCase()] ?? slug.toUpperCase()
