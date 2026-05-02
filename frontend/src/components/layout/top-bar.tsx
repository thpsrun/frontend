import { Link } from "react-router"
import { NavMenu } from "@/components/layout/nav-menu"
import { Logo } from "@/components/layout/logo"
import { Socials } from "@/components/layout/socials"
import { AuthButton } from "@/components/auth/auth-button"

export const TopBar = () => {
    return (
        <div className="w-full h-8 bg-background p-6 flex items-center justify-between rounded-lg z-1">
            <div className="flex items-center space-x-4">
                <Logo />
                <NavMenu />
                <Link
                    to="/guides"
                    className="text-sm font-medium hover:text-primary"
                >
                    Guides
                </Link>
            </div>
            <div className="flex items-center space-x-4">
                <Socials />
                <AuthButton />
            </div>
        </div>
    )
}
