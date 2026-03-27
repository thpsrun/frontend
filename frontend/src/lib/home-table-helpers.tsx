/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState } from "react"
import { Link } from "react-router"

import { CountryFlag, type CountryCode } from "@/lib/leaderboard-helpers"


interface GameSpan {
    show: boolean
    rowSpan: number
    groupIndex: number
}

/**
 * Computes row-span metadata for grouping consecutive table rows
 * that share the same game. Builds an array parallel to the data
 * where each entry indicates whether to show the merged game cell,
 * how many rows it spans, and which group it belongs to (for hover
 * highlighting).
 */
export function useGameGroupSpans<T>(
    data: T[],
    getGameKey: (item: T) => string,
) {
    const [hoveredGroup, setHoveredGroup] =
        useState<number | null>(null)

    const gameSpans = useMemo(() => {
        const spans: GameSpan[] = []
        let i = 0
        let groupIndex = 0
        while (i < data.length) {
            const key = getGameKey(data[i])
            let count = 1
            while (
                i + count < data.length
                && getGameKey(data[i + count]) === key
            ) {
                count++
            }
            for (let j = 0; j < count; j++) {
                spans.push({
                    show: j === 0,
                    rowSpan: count,
                    groupIndex,
                })
            }
            groupIndex++
            i += count
        }
        return spans
    }, [data, getGameKey])

    return { gameSpans, hoveredGroup, setHoveredGroup }
}


interface PlayerInfo {
    name: string | null
    nickname?: string | null
    country?: { id: string; name: string } | null
}

interface PlayerCellProps {
    players: PlayerInfo[]
}

/**
 * Renders a list of players with country flags, profile links,
 * and comma separators. Used by both CurrentRecords and LatestRuns.
 */
export const PlayerCell = ({ players }: PlayerCellProps) => {
    if (players.length === 0) return <>Anonymous</>

    return (
        <>
            {players.map((player, idx) => (
                <span
                    key={player.name ?? idx}
                    className="flex items-center mr-2"
                >
                    {player.country?.id && (
                        <CountryFlag
                            countryCode={
                                player.country
                                    .id as CountryCode
                            }
                            title={player.country.name}
                        />
                    )}
                    {player.name ? (
                        <Link
                            to={`/player/${player.name}`}
                            className="text-link hover:underline"
                        >
                            {player.nickname || player.name}
                        </Link>
                    ) : (
                        "Anonymous"
                    )}
                    {idx < players.length - 1 && ", "}
                </span>
            ))}
        </>
    )
}
