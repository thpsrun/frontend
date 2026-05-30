import { NavMenu } from "@/components/layout/nav-menu"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Logo } from "@/components/layout/logo"
import { Socials } from "@/components/layout/socials"
import { AuthButton } from "@/components/auth/auth-button"

export const TopBar = () => {
    return (
        <div className="w-full bg-background px-4 py-3 md:px-6 md:py-2 flex items-center justify-between rounded-lg relative z-50 gap-2">
            <div className="flex items-center gap-2 xl:gap-4">
                <div className="lg:hidden">
                    <MobileNav />
                </div>
                <Logo />
                <div className="hidden lg:block [&_a]:px-2.5 [&_button]:px-2.5 xl:[&_a]:px-4 xl:[&_button]:px-4">
                    <NavMenu />
                </div>
            </div>
            <div className="flex items-center gap-2 xl:gap-4">
                <div className="hidden xl:block">
                    <Socials />
                </div>
                <AuthButton />
            </div>
        </div>
    )
}
