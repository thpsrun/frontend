import type { MouseEvent, ReactNode } from "react"
import { Link } from "react-router"

import { GradientUsername } from "@/components/profile/gradient-username"
import type { Gradients } from "@/lib/gradients"
import { cn } from "@/lib/utils"

const ANONYMOUS_NAME = "Anonymous"

interface PlayerLinkProps {
    name: string | null | undefined
    nickname?: string | null
    gradients?: Gradients | null
    asLink?: boolean
    className?: string
    nameClassName?: string
    target?: string
    onClick?: (e: MouseEvent) => void
    // What to render for an Anonymous or missing player. Defaults to "Anonymous".
    anonymous?: ReactNode
}

// Renders a single player's name. "Anonymous" (and missing names) render as
// plain text, never a /player link.
export function PlayerLink({
    name,
    nickname,
    gradients,
    asLink = true,
    className,
    nameClassName,
    target,
    onClick,
    anonymous = ANONYMOUS_NAME,
}: PlayerLinkProps) {
    if (!name || name === ANONYMOUS_NAME) {
        return <>{anonymous}</>
    }

    const display = (
        <GradientUsername
            name={nickname || name}
            gradients={gradients ?? null}
            className={nameClassName}
        />
    )

    if (!asLink) return display

    return (
        <Link
            to={`/player/${encodeURIComponent(name)}`}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
            onClick={onClick}
            className={cn("hover:underline", className)}
        >
            {display}
        </Link>
    )
}
