import { Link } from "react-router"

export const Logo = () => {
    return (
        <Link
            to="/"
            className="text-logo-2 text-3xl font-display font-normal -skew-x-12"
        >
            <span className="text-logo-1">thps.</span>run
        </Link>
    )
}
