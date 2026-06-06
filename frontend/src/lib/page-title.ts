export const SITE_NAME = "thps.run"

export const buildTitle = (segment?: string | null): string =>
    segment ? `${segment} | ${SITE_NAME}` : SITE_NAME

export const sectionTitle = (
    pathname: string,
    base: string,
    prefix: string,
    labels: Record<string, string>,
): string => {
    const rest = pathname.startsWith(base)
        ? pathname.slice(base.length).replace(/^\//, "")
        : ""
    const seg = rest.split("/")[0] ?? ""
    const label = labels[seg]
    return label ? `${prefix} · ${label}` : prefix
}
