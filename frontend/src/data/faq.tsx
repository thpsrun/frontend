import type { ReactNode } from "react"
import { Link } from "react-router"

export type FaqEntry = {
    id: string,
    question: string,
    answer: ReactNode,
}

export const FAQ_ENTRIES: FaqEntry[] = [
    {
        id: "what-is-thps-run",
        question: "What is thps.run?",
        answer: (
            <p className="leading-relaxed">
                thps.run is a community-driven speedrunning leaderboard and website
                for the Tony Hawk's Pro Skater franchise. It provides verified rankings,
                player profiles, run history, points scoring, and much more for
                speedrunners of the series.
            </p>
        ),
    },
    {
        id: "what-are-points",
        question: "What are Points?",
        answer: (
            <div className="flex flex-col gap-2">
                <p className="leading-relaxed">
                    Points (lovingly referred to as Packle Points by the community) is a sort-of numerical
                    score given to all speedruns on this site. Originally developed by goatrope and ibeechu at{" "}
                    <Link to="https://haloruns.com">HaloRuns</Link>, this system incentivizes players to venture
                    out from their normal speedgames and get better in multiple games to add to their global "score".
                </p>
                <p className="leading-relaxed">
                    Here is how points are distributed:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-2">
                    <li>Maximum points are given to the World Record for that specific category/subcategory or
                        individual level. The points given are as follows:
                        <ul className="list-disc pl-6 mt-1">
                            <li>Fullgame (non-Category Extensions) = 1000 points</li>
                            <li>Individual Levels = 250 points</li>
                            <li>All Category Extensions = 50 points</li>
                        </ul>
                    </li>
                    <li>All subsequent runs in the category will receive reduced points (unless they are tied for
                        the record). There are TWO different formulas used by this site; one for shorter categories
                        and ILs off a minute or less AND the base formula.
                        <ul className="list-disc pl-6 mt-1">
                            <li>Basic Formula:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>In Python: <br /> <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">math.floor((0.008 * math.pow(math.e, 4.8284 * (wr_time/pb_secs)))) * run_type)</code> <br />
                                        Written Formula:<br /> <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">P = 0.008 * e<sup>4.8284x</sup> * y</code>
                                        <ul className="list-disc pl-6 mt-1">
                                            <li>X = World Record Seconds / Personal Best Seconds</li>
                                            <li>Y = 1000 for FG / 250 for ILs / 50 for CEs</li>
                                        </ul>
                                    </li>
                                    <li>As an example of how points are reduced, here is how many points a player will receive when the
                                        World Record is 1:20:00.
                                        <ul className="list-disc pl-6 mt-1">
                                            <li>1:20:00 = 1000 points (World Record)</li>
                                            <li>1:25:00 = 752 points</li>
                                            <li>1:30:00 = 584 points</li>
                                            <li>1:40:00 = 380 points</li>
                                            <li>3:00:00 = 68 points</li>
                                            <li>4:00:00 = 40 points</li>
                                            <li>5:00:00 = 28 points</li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li>Shorter Formula:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>In Python: <br /> <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">math.floor((math.pow(math.e, (4.8284 * math.sqrt(wr_time / 60) * (wr_time/pb_secs)))) * run_type</code> <br />
                                        Written Formula: <br /> <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">e<sup>(4.8284 * √(X/60) * (X/Y - 1))</sup> * z</code>
                                        <ul className="list-disc pl-6 mt-1">
                                            <li>X = World Record Seconds</li>
                                            <li>Y = Personal Best Seconds</li>
                                            <li>Z = 1000 for FG / 250 for ILs / 50 for CEs</li>
                                        </ul>
                                    </li>
                                    <li>Since this a much different formula, here is an example of a 10-second and 30-second IL: <br />
                                        <strong>10-Second IL:</strong>
                                        <div className="rounded-md border border-border/40 overflow-hidden mt-2">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-muted/20">
                                                        <th className="px-3 py-2 text-left font-semibold">Placement</th>
                                                        <th className="px-3 py-2 text-left font-semibold">Time (RTA)</th>
                                                        <th className="px-3 py-2 text-left font-semibold">Old Algorithm</th>
                                                        <th className="px-3 py-2 text-left font-semibold">New Algorithm</th>
                                                        <th className="px-3 py-2 text-left font-semibold">Differential</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="px-3 py-1.5">1</td>
                                                        <td className="px-3 py-1.5">0:10</td>
                                                        <td className="px-3 py-1.5">100</td>
                                                        <td className="px-3 py-1.5">100</td>
                                                        <td className="px-3 py-1.5 font-semibold">--</td>
                                                    </tr>
                                                    <tr className="bg-muted/10">
                                                        <td className="px-3 py-1.5">2</td>
                                                        <td className="px-3 py-1.5">0:11</td>
                                                        <td className="px-3 py-1.5">64</td>
                                                        <td className="px-3 py-1.5">83</td>
                                                        <td className="px-3 py-1.5 font-semibold">+19</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-3 py-1.5">3</td>
                                                        <td className="px-3 py-1.5">0:12</td>
                                                        <td className="px-3 py-1.5">44</td>
                                                        <td className="px-3 py-1.5">71</td>
                                                        <td className="px-3 py-1.5 font-semibold">+27</td>
                                                    </tr>
                                                    <tr className="bg-muted/10">
                                                        <td className="px-3 py-1.5">4</td>
                                                        <td className="px-3 py-1.5">0:15</td>
                                                        <td className="px-3 py-1.5">19</td>
                                                        <td className="px-3 py-1.5">51</td>
                                                        <td className="px-3 py-1.5 font-semibold">+32</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-3 py-1.5">5</td>
                                                        <td className="px-3 py-1.5">0:17</td>
                                                        <td className="px-3 py-1.5">13</td>
                                                        <td className="px-3 py-1.5">44</td>
                                                        <td className="px-3 py-1.5 font-semibold">+31</td>
                                                    </tr>
                                                    <tr className="bg-muted/10">
                                                        <td className="px-3 py-1.5">6</td>
                                                        <td className="px-3 py-1.5">0:20</td>
                                                        <td className="px-3 py-1.5">8</td>
                                                        <td className="px-3 py-1.5">37</td>
                                                        <td className="px-3 py-1.5 font-semibold">+29</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <strong>30-Second IL:</strong> <br />
                                        <div className="rounded-md border border-border/40 overflow-hidden mt-2">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-muted/20">
                                                        <th className="px-3 py-2 text-left font-semibold">Placement</th>
                                                        <th className="px-3 py-2 text-left font-semibold">Time (RTA)</th>
                                                        <th className="px-3 py-2 text-left font-semibold">Old Algorithm</th>
                                                        <th className="px-3 py-2 text-left font-semibold">New Algorithm</th>
                                                        <th className="px-3 py-2 text-left font-semibold">Differential</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="px-3 py-1.5">1</td>
                                                        <td className="px-3 py-1.5">0:30</td>
                                                        <td className="px-3 py-1.5">100</td>
                                                        <td className="px-3 py-1.5">100</td>
                                                        <td className="px-3 py-1.5 font-semibold">--</td>
                                                    </tr>
                                                    <tr className="bg-muted/10">
                                                        <td className="px-3 py-1.5">2</td>
                                                        <td className="px-3 py-1.5">0:31</td>
                                                        <td className="px-3 py-1.5">85</td>
                                                        <td className="px-3 py-1.5">89</td>
                                                        <td className="px-3 py-1.5 font-semibold">+4</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-3 py-1.5">3</td>
                                                        <td className="px-3 py-1.5">0:34</td>
                                                        <td className="px-3 py-1.5">56</td>
                                                        <td className="px-3 py-1.5">66</td>
                                                        <td className="px-3 py-1.5 font-semibold">+10</td>
                                                    </tr>
                                                    <tr className="bg-muted/10">
                                                        <td className="px-3 py-1.5">4</td>
                                                        <td className="px-3 py-1.5">0:44</td>
                                                        <td className="px-3 py-1.5">21</td>
                                                        <td className="px-3 py-1.5">33</td>
                                                        <td className="px-3 py-1.5 font-semibold">+12</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-3 py-1.5">5</td>
                                                        <td className="px-3 py-1.5">0:50</td>
                                                        <td className="px-3 py-1.5">14</td>
                                                        <td className="px-3 py-1.5">25</td>
                                                        <td className="px-3 py-1.5 font-semibold">+11</td>
                                                    </tr>
                                                    <tr className="bg-muted/10">
                                                        <td className="px-3 py-1.5">6</td>
                                                        <td className="px-3 py-1.5">1:00</td>
                                                        <td className="px-3 py-1.5">8</td>
                                                        <td className="px-3 py-1.5">18</td>
                                                        <td className="px-3 py-1.5 font-semibold">+10</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        ),
    },
    {
        id: "how-do-streaks-work",
        question: "How do Streaks work?",
        answer: (
            <div className="flex flex-col gap-2">
                <p className="leading-relaxed">
                    Streaks are a bonus-point system that both gives a world record holder
                    additional points for each month they are atop a leaderboard, and also a
                    "bounty" to knock them off their top spot.
                </p>
                <p className="leading-relaxed">
                    Bonus points are awarded on the <strong>anniversary day</strong> of the record by
                    that player. It is player-based; meaning, if the record is beaten by the same player,
                    the streak stays! BUT, if the record is beaten by anyone for any amount of time, the streak
                    is broken!
                </p>
                <div className="leading-relaxed">
                    Here is how bonus points are awarded:
                    <ul className="list-disc pl-6 mt-1">
                        <li>Full Game Runs: 125 points/month for a maximum of 4 months <br />
                            1000 {"->"} 1125 {"->"} 1250 {"->"} 1375 {"->"} 1500 (MAX)
                        </li>
                        <li>IL Runs: 31.25 points/month for a maximum of 4 months <br />
                            250 {"->"} 281 {"->"} 313 {"->"} 344 {"->"} 375 (MAX)
                        </li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        id: "how-are-runs-added",
        question: "How are speedruns added to this site? Can I submit my own here?",
        answer: (
            <div className="flex flex-col gap-2">
                <p className="leading-relaxed">
                    Speedruns are added to this site through a custom-made API. Whenever a speedrun is
                    approved on Speedrun.com (SRC), the information for that run (including time, category, player(s),
                    platform, and other metadata) is sent to the aforementioned API. After it is processed, the run is
                    added to this website's database and can be displayed on here. Luckily, the time to wait after a
                    run is approved is quick... But, it depends on how the SRC API is that day.
                </p>
                <p className="leading-relaxed">
                    On sign-up or by adding your SRC API key to your profile settings after making an account, you can
                    submit runs on this site for the category/subcategory or IL of your choice. Once submitted, the runs
                    are forwarded to SRC for approval/disapproval.
                </p>
            </div>
        ),
    },
    {
        id: "run-not-showing-up",
        question: "Why isn't my run showing up on here?",
        answer: (
            <div className="flex flex-col gap-2">
                <p className="leading-relaxed">
                    TL;DR: Someone probably approved your speedrun too quickly on SRC; there is a ~5 minute delay on a run
                    appearing on the main site and it appearing in the API. If that happens, it is never "found" by the syncer
                    agents. If this happens, let an admin on the Discord server know!
                </p>
                <p className="leading-relaxed">
                    thps.run is a compliment to the SRC leaderboards, and is currently not a replacement for it. Due to how
                    SRC's API is setup (e.g. no webhooks), there is a special syncer agent service that works to search the SRC API
                    every minute, process them, and send them to the thps.run API. When the syncer agent sees a change, it will also
                    forward the changed contents to here.
                </p>
                <p className="leading-relaxed">
                    Depending on a number of factors (e.g. SRC API dying, caching issues), someone may have approved the run on
                    the main SRC site and the API never "saw" it. Then, there is weird instances where the caching can work against the run
                    and not be seen as "approved" for a while. /shrug
                </p>
            </div>
        ),
    },
    {
        id: "access-api",
        question: "Can I use the thps.run API?",
        answer: (
            <div className="flex flex-col gap-2">
                <p className="leading-relaxed">
                    Yes! You are fully allowed to use the API for your projects, bots, tools, and so-on. Obviously, you should be responsible with what you are doing.
                    If you are interested, go to <Link to="/profile/settings/api-keys">your profile's API Keys page</Link> - there, you can create API keys for various
                    methods with your current roles with the site. If you are a regular user, you will have vastly less powers (e.g. no PUT, PUSH, PATCH, DELETE, and so on),
                    but you can still perform GET requests to various endpoints. Moderators can request a lot more and scope it to the specific games of which they moderate,
                    and super admins (super mods, essentially) can use broader powers to programmatically edit the site.
                </p>
                <p className="flex flex-col gap-2">
                    <Link to="/api/v1/docs">thps.run API Documentation</Link>
                </p>
            </div>
        )
    },
    {
        id: "why-thps-run",
        question: "Why should I use thps.run?",
        answer: (
            <div className="flex flex-col gap-2">
                <p className="leading-relaxed">
                    SRC is a very nice site, and thps.run does not aim to be a competitor. This site helps give more power, functionality,
                    and accessibility to the Tony Hawk Speedrun Community's data. With a more robust and easier-to-manage API, more features
                    that extend our moderating capabilities, and providing a more seamless, less ad-ridden interface, the aim for this project
                    is instead to provide the best possible experience for runners and followers of the community.
                </p>
                <p className="leading-relaxed">
                    This entire project - which is open-source by the way! -  is a love letter to the Tony Hawk Speedrun Community. And, while 
                    SRC is a good site that helps unite the leaderboards under  one roof, speedrunning lives and dies by community collaboration.
                </p>
                <p className="leading-relaxed">
                    No singular entity should ever hold control of speedrun communities. And, thus, this project is available for others to use,
                    tinker, learn from, adapt to, and evolve with.
                </p>
            </div>
        )
    }
]
