import { OAuthResultPage } from "@/components/auth/oauth-result-page"

export function OAuthCancelledPage() {
    return (
        <OAuthResultPage
            title="Login Cancelled"
            message="You cancelled the login process."
        />
    )
}
