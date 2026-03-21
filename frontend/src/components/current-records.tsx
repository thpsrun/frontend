import { useMemo, useState } from "react"
import { Link } from "react-router"
import { useTHPSRuns } from "@/hooks/useTHPSData"
import { cn } from "@/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import * as flags from "country-flag-icons/react/3x2"

type CountryCode = keyof typeof flags

const CountryFlag = ({ countryCode }: { countryCode: CountryCode }) => {
    const FlagIcon = flags[countryCode.toUpperCase() as CountryCode]
    if(!FlagIcon) return <></>
    return <FlagIcon className="w-7 pr-1" />
}

export const CurrentRecords = () => {
    const { data: runs } = useTHPSRuns()

    const [hoveredGroup, setHoveredGroup] = useState<number | null>(null);

    const gameSpans = useMemo(() => {
        const spans: {
            show: boolean;
            rowSpan: number;
            groupIndex: number;
        }[] = [];
        let i = 0;
        let groupIndex = 0;
        while (i < runs.length) {
            const gameName = runs[i].game.name;
            let count = 1;
            while (
                i + count < runs.length &&
                runs[i + count].game.name === gameName
            ) {
                count++;
            }
            for (let j = 0; j < count; j++) {
                spans.push({
                    show: j === 0,
                    rowSpan: count,
                    groupIndex,
                });
            }
            groupIndex++;
            i += count;
        }
        return spans;
    }, [runs]);

    return (
        <div className="flex-1 rounded-lg p-6 flex flex-col">
            <h1 className="text-xl font-semibold mb-4">
                Current Records
            </h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Game</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="w-[300px]">Player</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody onMouseLeave={() => setHoveredGroup(null)}>
                    {runs.map((run, i) => (
                        <TableRow
                            key={i}
                            className={cn(
                                "hover:bg-transparent",
                                hoveredGroup === gameSpans[i]?.groupIndex
                                    && "[&>td]:bg-muted/50",
                                gameSpans[i]?.show && i > 0
                                    && "border-t-4 border-t-border",
                            )}
                            onMouseEnter={() =>
                                setHoveredGroup(
                                    gameSpans[i]?.groupIndex ?? null,
                                )
                            }
                        >
                            {gameSpans[i]?.show && (
                                <TableCell
                                    className={cn(
                                        "font-medium align-middle",
                                        hoveredGroup === gameSpans[i]?.groupIndex
                                            && "bg-muted/50",
                                    )}
                                    rowSpan={gameSpans[i].rowSpan}
                                >
                                    {run.game.name}
                                </TableCell>
                            )}
                            <TableCell>{run.subcategory}</TableCell>
                            <TableCell className="flex items-center">
                                {run.players.length > 0 ? (
                                    run.players.map((recordPlayer, idx) => (
                                        <span key={idx} className="flex items-center mr-2">
                                            {recordPlayer.player?.country && <CountryFlag countryCode={recordPlayer.player.country as CountryCode} />}
                                            {recordPlayer.player?.name ? (
                                                <Link
                                                    to={`/player/${recordPlayer.player.name}`}
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    {recordPlayer.player.nickname || recordPlayer.player.name}
                                                </Link>
                                            ) : (
                                                "Anonymous"
                                            )}
                                            {idx < run.players.length - 1 && ", "}
                                        </span>
                                    ))
                                ) : (
                                    "Anonymous"
                                )}
                            </TableCell>
                            <TableCell>
                                {run.players[0]?.video ? (
                                    <a
                                        href={run.players[0].video.includes("twitch")
                                            && run.players[0].arch_video
                                            ? run.players[0].arch_video
                                            : run.players[0].video}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline"
                                    >
                                        {run.time}
                                    </a>
                                ) : (
                                    run.time
                                )}
                            </TableCell>
                            <TableCell>
                                {new Date(run.players[0].date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}