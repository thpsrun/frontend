import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PrivacyPage() {
    return (
        <div className="flex justify-center pt-8">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Privacy Policy
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Last updated: March 26, 2026
                    </p>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none flex flex-col gap-6 text-sm text-foreground/90">
                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            1. Information We Collect
                        </h2>
                        <p className="leading-relaxed">
                            When you create an account, we collect your
                            username, email address, and any profile
                            information you choose to provide. We also
                            collect speedrun submissions and associated
                            metadata (game, category, time, video links).
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            2. How We Use Your Information
                        </h2>
                        <p className="leading-relaxed">
                            Your information is used to operate the
                            leaderboard, display public profiles and
                            speedrun records, and communicate important
                            updates about your account or submissions.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            3. Third-Party Services
                        </h2>
                        <p className="leading-relaxed">
                            We support OAuth login through Discord and
                            Twitch. When you use these services, their
                            respective privacy policies apply. We only
                            receive the information necessary to
                            authenticate your account.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            4. Cookies
                        </h2>
                        <p className="leading-relaxed">
                            We use essential cookies to maintain your
                            login session and remember your preferences
                            (such as theme selection). We do not use
                            tracking or advertising cookies.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            5. Data Retention
                        </h2>
                        <p className="leading-relaxed">
                            Your account data and speedrun submissions
                            are retained as long as your account is
                            active. You may request deletion of your
                            account and associated data at any time by
                            contacting us.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            6. Contact
                        </h2>
                        <p className="leading-relaxed">
                            For privacy-related questions or requests,
                            reach out via the community Discord server or
                            email the site administrators.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    )
}
