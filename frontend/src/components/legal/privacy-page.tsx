import { Link } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Panel } from "@/components/ui/panel"
import { PageShell } from "@/components/common/page-shell"

type PrivacySection = {
    id: string,
    title: string,
}

const PRIVACY_SECTIONS: PrivacySection[] = [
    { id: "overview", title: "Overview" },
    { id: "what-is-collected", title: "What Is Collected" },
    { id: "storage-and-data", title: "Storage and Data" },
    { id: "social-media", title: "Social Media and Third-Party Websites" },
    { id: "exemptions", title: "Exemptions" },
    { id: "age-restrictions", title: "Age Restrictions" },
    { id: "cookies", title: "Cookies" },
    { id: "ads", title: "Ads" },
    { id: "final-words", title: "Final Words" },
]

export function PrivacyPage() {
    return (
        <PageShell width="lg">
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:gap-8">
                <aside className="lg:w-64 lg:shrink-0">
                    <Panel className="lg:sticky lg:top-20">
                        <nav aria-label="Table of contents">
                            <h3 className="mb-3 text-sm font-semibold text-foreground">
                                Privacy Policy Table of Contents
                            </h3>
                            <ul className="flex flex-col gap-2 text-sm">
                                {PRIVACY_SECTIONS.map((section) => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className="block leading-snug text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {section.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </Panel>
                </aside>
                <div className="min-w-0 flex-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                thps.run Privacy Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-invert max-w-none flex flex-col gap-6 text-sm text-foreground/90">
                            <section id="overview" className="flex flex-col gap-2 scroll-mt-24">
                                <p className="leading-relaxed">
                                    Last Updated: June 1, 2026
                                </p>
                                <p className="leading-relaxed">
                                    This document shall serve as the Privacy Policy for thps.run.
                                </p>
                                <p className="leading-relaxed">
                                    All instances of "the website", "website", "site", or "we" will be in reference to thps.run.
                                </p>
                                <p className="leading-relaxed">
                                    All instances of "you" or "your" will be in reference to any user that uses this website.
                                </p>
                                <p className="leading-relaxed">
                                    thps.run is operated by Anastasia R. (a resident of the United States), with this site being
                                    a non-commercial community project. For privacy-related inquiries, contact: revoke (at) thps (dot) run.
                                </p>
                            </section>

                            <section id="what-is-collected" className="flex flex-col gap-2 scroll-mt-24">
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
                                        with this site using Sentry.io (see "Storage and Data" below).
                                    </li>
                                </ul>
                                <p className="leading-relaxed">
                                    You are not required to submit any personal data to use this website, but registration
                                    is required to perform additional actions.
                                </p>
                                <p className="leading-relaxed">
                                    Under the European Union's (EU) General Data Protection Regulation (GDPR), you have the right to access,
                                    rectify, erase, restrict processing of, object to  processing of, and port your personal data.
                                    You also have the right to lodge a complaint with your local data protection supervisory authority.
                                </p>
                            </section>

                            <section id="storage-and-data" className="flex flex-col gap-2 scroll-mt-24">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Storage and Data
                                </h2>
                                <ul className="list-disc pl-6 flex flex-col gap-2 leading-relaxed">
                                    <li>
                                        All collected user data on this site is encrypted in transit via TLS and at rest. Once every 24 hours,
                                        users can request a full export of all of their data from this website in <Link to="/profile/settings/danger" className="text-link hover:underline">
                                        their profile settings.</Link>
                                    </li>
                                    <li>
                                        Audit logs on PUT, POST, PATCH, and DELETE API requests are collected - to include IP addresses - for security and non-repudiation.
                                        This data is stored on the encrypted database, and is only accessible to website administrators. This data is retained for 90 days.
                                    </li>
                                    <li>
                                        The database is backed up twice a day to a Hetzner S3 bucket in Helsinki, Finland after they are encrypted. Backups last 90 days, then are deleted.
                                    </li>
                                    <li>
                                        All user data is transmitted and stored from the European Union via Hetzner, specifically
                                        Helsinki, Finland.
                                    </li>
                                    <li>
                                        All user data is retained on this site until your account is terminated. Any
                                        users wishing to exempt themselves and their runs from the site and its services
                                        may do so without penalty, restraint, or issue (please see the section below this
                                        document for additional details) and shall be removed within 30 days of notice.
                                    </li>
                                    <li>
                                        We do not, in any way, claim ownership of user-submitted content. As mentioned in an earlier section,
                                        you can request data exportation from your profile settings and delete your account at any time. If you wish to lodge
                                        a complaint at this website, exempt yourself from its services, or wish to ask questions pertaining to this policy,
                                        please do so via email: revoke (at) thps (dot) run.
                                    </li>
                                    <li>
                                        Users are allowed to create API Keys on this website to develop or program tools and bots to interact with the site via
                                        our public API. Users can revoke these keys at any time.
                                    </li>
                                </ul>
                                <ul className="list-disc pl-6 flex flex-col gap-2 leading-relaxed">
                                    <li>
                                        Sub-processors:
                                        <ul className="list-disc pl-6 flex flex-col gap-2 leading-relaxed">
                                            <li>Sentry.io <a href="https://sentry.io/privacy/">(Privacy Policy - link)</a>: Collects errors, stack traces,
                                                and browser/OS information (to include User Agents). IPs are not transmitted.
                                            </li>
                                        </ul>
                                        <ul className="list-disc pl-6 flex flex-col gap-2 leading-relaxed">
                                            <li>Cloudflare <a href="https://www.cloudflare.com/privacypolicy/">(Privacy Policy - link)</a>: Acts as the website's
                                                Distributed Denial of Service (DDOS) defense and Domain Name Server (DNS). Cloudflare also proxies traffic and
                                                data can transit through their global network outside of the EU.
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </section>

                            <section id="social-media" className="flex flex-col gap-2 scroll-mt-24">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Social Media and Third-Party Websites
                                </h2>
                                <p className="leading-relaxed">
                                    The website provides connections to social media platforms. Optionally, users can add these
                                    connections to their profile, which allows them to login without their standard username and password.
                                    This data is displayed on the user's profile, and is not collected or sold for any purpose.
                                </p>
                                <p className="leading-relaxed">
                                    This website allows you to register and login via Twitch and Discord using OAuth. When this is done, your username, unique ID, and
                                    email are stored. Upon revoking an OAuth provider, this data is deleted.
                                </p>
                                <p className="leading-relaxed">
                                    This site contains links to third-party websites (such as Speedrun.com), henceforth referred to as "third-party website" or
                                    "third-party websites". These third-party websites are not under the control of this site and we shall disclaim any and all
                                    responsibility on its contents. We are not responsible for webcasting, tracking cookies, regular cookies, advertisements, and other
                                    such functions that are transmitted from third-party websites. We are providing these links for convenience, and their inclusion
                                    does not imply an endorsement or representation of said third-party website.
                                </p>
                            </section>

                            <section id="exemptions" className="flex flex-col gap-2 scroll-mt-24">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Exemptions
                                </h2>
                                <p className="leading-relaxed">
                                    All users utilizing this website - whether it be administrators or users without accounts - are allowed
                                    to exempt themselves from the site's leaderboards. When reviewed and approved, you will be added to an
                                    "exemptions" list when performing SRC API checks. Exempted users will still have their run linked back to
                                    their SRC run link, but they will not receive points or other such site-specific features. Your runs will
                                    then be linked to "Anonymous" for historical purposes.
                                </p>
                            </section>

                            <section id="age-restrictions" className="flex flex-col gap-2 scroll-mt-24">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Age Restrictions
                                </h2>
                                <p className="leading-relaxed">
                                    To the extent prohibited by applicable law, this website is compliant with the Childen's Online Privacy Protection Act
                                    (COPPA) of 1998 within the United States. Users must be at least 13 years of age or higher where required by local law to join this website.
                                    If you learn someone on SRC or here is younger than 13 (or whichever the lowest is in their jurisdiction), we will delete their account and
                                    anonymize their runs.
                                </p>
                            </section>

                            <section id="cookies" className="flex flex-col gap-2 scroll-mt-24">
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
                                        The Cross-site Request Forgery (CSRF) Token is an unpredictable secret between your device and the website. This helps
                                        protect you by ensuring requests to thps.run originate from pages you intentionally loaded and will block forged requests
                                        submitted from other pages on your behalf.
                                    </li>
                                    <li>
                                        SessionID is needed for authenticated states to stay logged-in and perform website functions.
                                    </li>
                                </ul>
                                <p className="leading-relaxed">
                                    These cookies can be cleared at any time in your browser settings, with the knowledge that a new CSRF Token will need
                                    to be generated and your login session will be wiped (requiring login again).
                                </p>
                            </section>

                            <section id="ads" className="flex flex-col gap-2 scroll-mt-24">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Ads
                                </h2>
                                <p className="leading-relaxed">
                                    This site is entirely ad free.
                                </p>
                            </section>

                            <section id="final-words" className="flex flex-col gap-2 scroll-mt-24">
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
                                    This policy may change in the future - such revisions will be announced to users whenever it occurs. Please refer to "Last Updated" at
                                    the top of the page. By accessing this site or utilizing its services, you acknowledge that you have read, understand, and accept this agreement.
                                </p>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageShell>
    )
}
