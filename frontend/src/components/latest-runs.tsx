import { useMemo, useState } from "react"
import { Link } from "react-router"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { cn } from "@/utils"
import * as flags from "country-flag-icons/react/3x2"
import type React from "react"
import type { DetailedRun } from "@/types/api"

type CountryCode = keyof typeof flags

const CountryFlag = ({ countryCode }: { countryCode: CountryCode }) => {
    const FlagIcon = flags[countryCode.toUpperCase() as CountryCode]
    if(!FlagIcon) return <></>
    return <FlagIcon className="w-7 pr-1" />
}

const SlugMap = {
    "thps34": "THPS 3+4",
    "thug1": "THUG",
    "thps2": "THPS2",
} as const;

type LatestRunsProps = {
    title: string
    data: DetailedRun[]
}

export const LatestRuns: React.FC<LatestRunsProps> = ({ title, data }) => {
    const [hoveredGroup, setHoveredGroup] = useState<number | null>(null);

    const gameSpans = useMemo(() => {
        const spans: {
            show: boolean;
            rowSpan: number;
            groupIndex: number;
        }[] = [];
        let i = 0;
        let groupIndex = 0;
        while (i < data.length) {
            const gameSlug = data[i].game.slug;
            let count = 1;
            while (
                i + count < data.length &&
                data[i + count].game.slug === gameSlug
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
    }, [data]);

    return (
        <div className="flex-1 rounded-lg p-6 flex flex-col">
            <h1 className="text-xl font-semibold mb-4">
                {title}
            </h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Game</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="w-[300px]">Player</TableHead>
                        <TableHead>Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody onMouseLeave={() => setHoveredGroup(null)}>
                    {data.map((run, i) => (
                        <TableRow
                            key={i}
                            className={cn(
                                "hover:bg-transparent",
                                hoveredGroup === gameSpans[i]?.groupIndex
                                    && "[&>td]:bg-muted/50",
                                gameSpans[i]?.show && i > 0
                                    && "border-t-2 border-t-border",
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
                                    {SlugMap[run.game.slug as keyof typeof SlugMap] || ""}
                                </TableCell>
                            )}
                            <TableCell>{run.subcategory}</TableCell>
                            <TableCell className="flex items-center">
                                {run.players.length > 0 ? (
                                    run.players.map((player, idx) => (
                                        <span key={idx} className="flex items-center mr-2">
                                            {player.country && <CountryFlag countryCode={player.country as CountryCode} />}
                                            {player.name ? (
                                                <Link
                                                    to={`/player/${player.name}`}
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    {player.name}
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
                                {run.video ? (
                                    <a
                                        href={run.video.includes("twitch") && run.arch_video
                                            ? run.arch_video
                                            : run.video}
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
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}