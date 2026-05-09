import { NavMenu } from "@/components/layout/nav-menu"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Logo } from "@/components/layout/logo"
import { Socials } from "@/components/layout/socials"
import { AuthButton } from "@/components/auth/auth-button"

export const TopBar = () => {
    return (
        <div className="w-full bg-background px-4 py-3 md:px-6 md:py-4 flex items-center justify-between rounded-lg z-1 gap-2">
            <div className="flex items-center gap-2 md:gap-4">
                <div className="md:hidden">
                    <MobileNav />
                </div>
                <Logo />
                <div className="hidden md:block">
                    <NavMenu />
                </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:block">
                    <Socials />
                </div>
                <AuthButton />
            </div>
        </div>
    )
}
