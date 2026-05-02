import { Link } from "react-router"
import { OAuthResultPage } from "@/components/auth/oauth-result-page"

export function NoLinkPage() {
    return (
        <OAuthResultPage
            title="No Linked Account"
            message={
                <>
                    That account isn't connected to a thps.run profile yet.
                    If you already have a thps.run account, log in with your username
                    and password, then connect it from your profile settings.
                    If you don't have one, you'll need to register first.
                    Registration requires at least one speedrun imported from
                    Speedrun.com.
                </>
            }
        >
            <Link
                to="/register"
                className="text-sm text-foreground underline underline-offset-4 hover:text-primary"
            >
                Register
            </Link>
        </OAuthResultPage>
    )
}
