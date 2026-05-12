import type { ReactNode } from "react"
import { Link } from "react-router"

interface OAuthResultPageProps {
    title: string
    message: ReactNode
    children?: ReactNode
}

export function OAuthResultPage({ title, message, children }: OAuthResultPageProps) {
    return (
        <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="max-w-md text-sm text-muted-foreground">
                {message}
            </p>
            <Link
                to="/login"
                className="text-sm text-foreground underline underline-offset-4 hover:text-primary"
            >
                Back to Login
            </Link>
            {children}
        </div>
    )
}
