import { useState } from "react"
import { useNavigate } from "react-router"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { usePlayerSearch } from "@/hooks/players/usePlayerSearch"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface UserSearchComboboxProps {
    autoFocus?: boolean
}

export function UserSearchCombobox({ autoFocus }: UserSearchComboboxProps) {
    const [query, setQuery] = useState("")
    const navigate = useNavigate()
    const { data, isFetching } = usePlayerSearch(query)

    return (
        <Command shouldFilter={false} className="border rounded-md">
            <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder="Search for player by name or nickname."
                autoFocus={autoFocus}
            />
            {query.length >= 2 && (
                <CommandList>
                    {isFetching ? (
                        <div
                            className={cn(
                                "flex items-center gap-2 px-3 py-2",
                                "text-sm text-muted-foreground",
                            )}
                        >
                            <Loader2 className="size-3 animate-spin" />
                            Searching...
                        </div>
                    ) : !data || data.length === 0 ? (
                        <CommandEmpty>No players found with information given.</CommandEmpty>
                    ) : (
                        <CommandGroup>
                            {data.map((player) => (
                                <CommandItem
                                    key={player.id}
                                    value={player.id}
                                    onSelect={() => {
                                        setQuery("")
                                        navigate(`/admin/users/${player.id}`)
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span>{player.nickname ?? player.name}</span>
                                        {player.nickname && (
                                            <span
                                                className={cn(
                                                    "text-xs",
                                                    "text-muted-foreground",
                                                )}
                                            >
                                                {player.name}
                                            </span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            )}
        </Command>
    )
}
