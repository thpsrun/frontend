import { OAuthResultPage } from "@/components/auth/oauth-result-page"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

// Landing page for disabled accounts at /login/banned. The api-client's banned handler
// (registered in main.tsx) hard-redirects here on any 403 "Account disabled" response.
export function BannedPage() {
    useDocumentTitle("Account Suspended")
    return (
        <OAuthResultPage
            title="Account Banned"
            message={
                <>
                    This account has been disabled by a superuser. Existing sessions and API keys have been revoked.
                    If you believe this was a mistake, please contact a moderator to appeal.
                </>
            }
        />
    )
}
