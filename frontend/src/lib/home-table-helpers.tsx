import { useMemo, useState } from "react"

import { CountryFlag, type CountryCode } from "@/lib/leaderboard-helpers"
import { PlayerLink } from "@/components/common/player-link"


interface GameSpan {
    show: boolean
    rowSpan: number
    groupIndex: number
}


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
    country?: {
        id: string
        name: string
        flag?: string | null
    } | null
    gradients?: {
        gradient_1: string | null
        gradient_2: string | null
        gradient_3: string | null
    } | null
}

interface PlayerCellProps {
    players: PlayerInfo[]
    compact?: boolean
}

export const PlayerCell = ({ players, compact = false }: PlayerCellProps) => {
    if (players.length === 0) return <>Anonymous</>

    return (
        <>
            {players.map((player, idx) => (
                <span
                    key={player.name ?? idx}
                    className="flex items-center min-w-0 mr-2"
                >
                    {player.country?.id && (
                        <CountryFlag
                            countryCode={
                                player.country
                                    .id as CountryCode
                            }
                            flagUrl={player.country.flag}
                            title={player.country.name}
                            className={compact
                                ? "w-5 pr-1 inline shrink-0"
                                : undefined}
                        />
                    )}
                    <PlayerLink
                        name={player.name}
                        nickname={player.nickname}
                        gradients={player.gradients}
                        className="text-link"
                    />
                    {idx < players.length - 1 && ", "}
                </span>
            ))}
        </>
    )
}
