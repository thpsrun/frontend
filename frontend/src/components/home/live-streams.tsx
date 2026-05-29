import { Fragment, useState } from "react"
import { ChevronDown, Radio, UserIcon } from "lucide-react"
import { FaTwitch } from "react-icons/fa"
import { cn } from "@/lib/utils"
import { BACKEND_URL } from "@/constants"
import { GradientUsername } from "@/components/profile/gradient-username"
import { PlayerLink } from "@/components/common/player-link"
import { useLiveStreams } from "@/hooks/home/useLiveStreams"
import type { Stream } from "@/types/api"

const renderCollapsedSummary = (streams: Stream[]) => {
    if (streams.length > 3) {
        return <>{streams.length} players are streaming!</>
    }

    const verb = streams.length === 1 ? "is" : "are"
    return (
        <>
            {streams.map((s, i) => (
                <Fragment key={s.player.id}>
                    {i > 0 && " & "}
                    <GradientUsername
                        name={s.player.name}
                        gradients={s.player.gradients ?? null}
                    />
                </Fragment>
            ))}
            {` ${verb} streaming!`}
        </>
    )
}

const twitchUrl = (handle: string | null | undefined): string | null => {
    if (!handle) return null
    if (/^https?:\/\//i.test(handle)) return handle
    return `https://twitch.tv/${handle.replace(/^@/, "")}`
}

const formatLiveFor = (iso: string | null | undefined): string | null => {
    if (!iso) return null
    const startMs = new Date(iso).getTime()
    if (Number.isNaN(startMs)) return null
    const diffSec = Math.floor((Date.now() - startMs) / 1000)
    if (diffSec < 0) return null
    if (diffSec < 60) return "just started"

    const days = Math.floor(diffSec / 86400)
    const hours = Math.floor((diffSec % 86400) / 3600)
    const minutes = Math.floor((diffSec % 3600) / 60)

    if (days > 0) {
        return hours > 0 ? `${days}d ${hours}h` : `${days}d`
    }
    if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${minutes}m`
}

export const LiveStreams = () => {
    const { data } = useLiveStreams()
    const [expanded, setExpanded] = useState(false)

    const streams = [...(data ?? [])].sort((a, b) => {
        const aMs = a.stream_time ? new Date(a.stream_time).getTime() : Infinity
        const bMs = b.stream_time ? new Date(b.stream_time).getTime() : Infinity
        return aMs - bMs
    })
    if (streams.length === 0) {
        return null
    }

    return (
        <div className="rounded-lg bg-background-transparent bg-opacity-10 backdrop-blur-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className={cn(
                    "w-full flex items-center gap-2 px-4 py-3 text-left",
                    "hover:bg-white/5 transition-colors cursor-pointer",
                )}
            >
                <Radio className="size-4 shrink-0 text-red-500 animate-pulse" />
                <span className="flex-1 truncate text-sm font-medium">
                    {renderCollapsedSummary(streams)}
                </span>
                <ChevronDown
                    className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        expanded && "rotate-180",
                    )}
                />
            </button>

            {expanded && (
                <ul className="border-t border-white/10 divide-y divide-white/5">
                    {streams.map((stream) => {
                        const url = twitchUrl(stream.player.twitch)
                        const liveFor = formatLiveFor(stream.stream_time)
                        return (
                            <li
                                key={stream.player.id}
                                className="px-4 py-3 flex items-start gap-3 text-sm"
                            >
                                {stream.player.pfp ? (
                                    <img
                                        src={`${BACKEND_URL}${stream.player.pfp}`}
                                        alt={stream.player.name}
                                        className="size-8 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="size-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                                        <UserIcon className="size-4 text-muted-foreground" />
                                    </div>
                                )}
                                {url && (
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        title={`Watch ${stream.player.name} on Twitch`}
                                        aria-label={`Watch ${stream.player.name} on Twitch`}
                                        className={cn(
                                            "shrink-0 inline-flex items-center justify-center",
                                            "size-8 rounded-md text-[#9146FF]",
                                            "hover:bg-[#9146FF]/15 transition-colors",
                                        )}
                                    >
                                        <FaTwitch size={16} />
                                    </a>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                        <PlayerLink
                                            name={stream.player.name}
                                            gradients={stream.player.gradients}
                                            nameClassName="font-medium"
                                        />
                                        {stream.game && (
                                            <span className="text-xs text-muted-foreground truncate">
                                                {stream.game.name}
                                            </span>
                                        )}
                                        {liveFor && (
                                            <span className="text-xs text-muted-foreground/80 shrink-0">
                                                live for {liveFor}
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className="text-xs text-muted-foreground truncate"
                                        title={stream.title}
                                    >
                                        {stream.title}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
