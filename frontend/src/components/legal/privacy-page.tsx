import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PrivacyPage() {
    return (
        <div className="flex justify-center pt-8">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        thps.run Privacy Policy
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none flex flex-col gap-6 text-sm text-foreground/90">
                    <section className="flex flex-col gap-2">
                        <p className="leading-relaxed">
                            This document shall serve as the Privacy Policy for thps.run.
                        </p>
                        <p className="leading-relaxed">
                            All instances of "the website", "website", "site", or "we" will be in reference to thps.run.
                        </p>
                        <p className="leading-relaxed">
                            All instances of "you" or "your" will be in reference to any user that uses this website.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            What Is Collected
                        </h2>
                        <ul className="list-disc pl-6 flex flex-col gap-2 leading-relaxed">
                            <li>
                                We collect email addresses during registration, but they are only intended
                                to be used for login or email recovery services. These email addresses are never,
                                ever given to a third-party.
                            </li>
                            <li>
                                We collect content via any interactions conducted via the website, such as
                                user-generated content. A grand majority of the content is served from the
                                SRC API, but some content is derived from user interactions (such as Guides).
                            </li>
                            <li>
                                We collect telemetry to identify and resolve any and all technical issues
                                with this site using Sentry.io. Private information is excluded from these results.
                            </li>
                        </ul>
                        <p className="leading-relaxed">
                            You are not required to submit any personal data to use this website, but registration
                            is required to perform additional actions.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Storage
                        </h2>
                        <ul className="list-disc pl-6 flex flex-col gap-2 leading-relaxed">
                            <li>
                                All collected user data on this site is encrypted in transit and at rest.
                            </li>
                            <li>
                                All user data is transmitted and stored from the European Union via a Hetzner
                                instance, specifically from TODO: ADD.
                            </li>
                            <li>
                                All user data is retained on this site until your account is terminated. Any
                                users wishing to exempt themselves and their runs from the site and its services
                                may do so without penalty, restraint, or issue (please see the section below this
                                document for additional details) and shall be removed within 30 days of notice.
                            </li>
                            <li>
                                All data on this site is the sole possession of the user in question. If you
                                wish lodge a complaint at this website, exempt yourself from its services, or wish
                                to ask questions pertaining to this policy, please do so via email: revoke (at) thps (dot) run.
                            </li>
                        </ul>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Social Media
                        </h2>
                        <p className="leading-relaxed">
                            The website provides connections to social media platforms. Optionally, users can add these
                            connections to their profile, which allows them to login without their standard username and password.
                            This data is displayed on the user's profile, and is not collected or sold for any purpose.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Exemptions
                        </h2>
                        <p className="leading-relaxed">
                            All users utilizing this website - whether it be administrators or users without accounts - are allowed
                            to exempt themselves fro mthe site's leaderboards. When reviewed and approved, you will be added to an
                            "exemptions" list when performing SRC API checks. Exempted users will still have their run linked back to
                            their SRC run link, but they will not receive points or other such site-specific features. Your runs will
                            then be linked to "Anonymous" for historical purposes.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Age Restrictions
                        </h2>
                        <p className="leading-relaxed">
                            To the extent prohibitied by applicable law, this website is compliant with the Child Online Protection Act
                            (COPA) of 1998 within the United States. Users must be at least 13 years of age to join this website and SRC.
                            If you learn someone on SRC or here are younger than 13, please contact us immediately.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Cookies
                        </h2>
                        <p className="leading-relaxed">
                            Cookies are defined as small amounts of data located on a user's hard drive or smart device that may include login
                            information, session data, and other such settings. These cookies are applicable to administrators, users, and
                            non-authenticated users. The usual cookies you will see are as follows:
                        </p>
                        <ul className="list-disc pl-6 flex flex-col gap-2 leading-relaxed">
                            <li>
                                The Cross-site Request Forgery (CSRF) Token is an unpredicable secret between your device and the website. This helps
                                protect you, ensuring only your device and execute code on your device.
                            </li>
                            <li>
                                SessionID is needed for authenticated states to stay logged-in and perform website functions.
                            </li>
                        </ul>
                        <p className="leading-relaxed">
                            These cookies can be cleared at any time in your browser settings, with the knoweldge that a new CSRF Token will need
                            to be generated and your login session will be wiped (requiring login again).
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Ads
                        </h2>
                        <p className="leading-relaxed">
                            This site is entirely ad free.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Third-Party Websites
                        </h2>
                        <p className="leading-relaxed">
                            This site contains links to third-party websites (such as Speedrun.com), henceforth referred to as "third-party website" or
                            "third-party websites". These third-party websites are not under the control of this site and we shall disclaim any and all
                            responsibility on its contents. We are not responsible for webcasting, tracking cookies, regular cookies, advertisements, and other
                            such functions that are transmitted from third-party websites. We are providing these links for convenience, and their inclusion
                            does not imply an endorsement or representation of said third-party website.
                        </p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            Final Words
                        </h2>
                        <p className="leading-relaxed">
                            You are encouraged to review the Privacy Policy, Terms of Conditions, or Terms of Service related to the associated third-party
                            website to know your rights and report problems as whenever required.
                        </p>
                        <p className="leading-relaxed">
                            We do not collect or aggregate user information for the intent of marketing or any other function other than what is required to
                            ensure site functionality, stability, and usage. We shall not use this information for profit nor share user information with third
                            parties.
                        </p>
                        <p className="leading-relaxed">
                            This policy may change without notice in the future. By accessing this site or utilizing its services, you acknowledge that you have
                            read, understand, and accept this agreement.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    )
}
