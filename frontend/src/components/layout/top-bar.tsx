import { NavMenu } from "@/components/layout/nav-menu"
import { Logo } from "@/components/layout/logo"
import { Socials } from "@/components/layout/socials"
import { AuthButton } from "@/components/auth/auth-button"

export const TopBar = () => {
    return (
        <div className="w-full bg-background px-4 py-3 md:px-6 md:py-2 flex items-center justify-between rounded-lg relative z-50 gap-2">
            <div className="flex items-center gap-2 xl:gap-4">
                <Logo />
                <div className="hidden lg:block">
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
