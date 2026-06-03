import { Link } from "react-router"

export const Logo = () => {
    return (
        <Link to="/" className="shrink-0">
            <img
                src="/logo.png"
                alt="thps.run"
                className="h-9 w-auto"
            />
        </Link>
    )
}
