import { OAuthResultPage } from "@/components/auth/oauth-result-page"

export function OAuthErrorPage() {
    return (
        <OAuthResultPage
            title="Login Error"
            message="Something went wrong during login. Please try again. If this error persists, contact Anasatasia on the Discord."
        />
    )
}
