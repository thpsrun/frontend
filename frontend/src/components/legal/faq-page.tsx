import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FAQPage() {
    return (
        <div className="flex justify-center pt-8">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Frequently Asked Questions
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 text-sm text-foreground/90">
                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            What is thps.run?
                        </h2>
                        <p className="leading-relaxed">
                            thps.run is a community-driven speedrunning
                            leaderboard for the Tony Hawk's Pro Skater
                            series. It provides verified rankings,
                            player profiles, and run history for
                            competitive THPS play.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            How do I submit a run?
                        </h2>
                        <p className="leading-relaxed">
                            Create an account and log in, then navigate
                            to the game and category you ran. Use the
                            submission form to enter your time and
                            provide a video link as proof. A moderator
                            will review and verify your submission.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            What are the rules for submissions?
                        </h2>
                        <p className="leading-relaxed">
                            Each game and category has its own specific
                            rules. Check the category description on the
                            leaderboard page for details. Generally, all
                            runs require video proof and must follow the
                            timing method specified for that category.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            How long does verification take?
                        </h2>
                        <p className="leading-relaxed">
                            Verification times vary depending on
                            moderator availability. Most runs are
                            reviewed within a few days. If your run has
                            been pending for an extended period, feel
                            free to reach out in the community Discord.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Can I link my Discord or Twitch account?
                        </h2>
                        <p className="leading-relaxed">
                            Yes! You can log in using Discord or Twitch
                            OAuth, or link these accounts to an existing
                            thps.run account in your profile settings.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Who runs this site?
                        </h2>
                        <p className="leading-relaxed">
                            thps.run is maintained by volunteers from the
                            THPS speedrunning community. It is not
                            affiliated with Activision or any official
                            Tony Hawk's Pro Skater entity.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    )
}
