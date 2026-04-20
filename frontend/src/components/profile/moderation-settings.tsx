import { useState } from "react"
import type { UseMutationResult } from "@tanstack/react-query"
import type {
    AuthMe, VerifySrcRequest, SRCKeyStatusResponse,
} from "@/types/auth"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"

interface ModerationSettingsProps {
    player: AuthMe
    setSrcKey: UseMutationResult<
        SRCKeyStatusResponse, Error, VerifySrcRequest
    >
    deleteSrcKey: UseMutationResult<void, Error, void>
}

export function ModerationSettings({
    player,
    setSrcKey,
    deleteSrcKey,
}: ModerationSettingsProps) {
    const [srcApiKey, setSrcApiKey] = useState("")
    const [message, setMessage] = useState<{
        type: "success" | "error"
        text: string
    } | null>(null)

    const handleSaveKey = async (
        e: React.SyntheticEvent,
    ) => {
        e.preventDefault()
        setMessage(null)

        if (!srcApiKey.trim()) return

        try {
            const result = await setSrcKey.mutateAsync({
                src_api_key: srcApiKey,
            })
            setMessage({
                type: "success",
                text: result.message,
            })
            setSrcApiKey("")
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error
                    ? err.message
                    : "Failed to Store API Key",
            })
        }
    }

    const handleRemoveKey = async () => {
        setMessage(null)

        try {
            await deleteSrcKey.mutateAsync()
            setMessage({
                type: "success",
                text: "API Key Removed!",
            })
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error
                    ? err.message
                    : "Failed to Remove API Key",
            })
        }
    }

    const gamesDisplay = player.moderation.moderated_games
        .map((g) => g.slug.toUpperCase())
        .join(", ")

    const isPending = setSrcKey.isPending
        || deleteSrcKey.isPending

    return (
        <Panel className="p-5">
            <h2 className="text-xl font-semibold">
                SRC API Key
            </h2>
            <p className={cn(
                "text-sm text-muted-foreground mb-4",
            )}>
                Manage your Speedrun.com API key for run approvals.
            </p>
            <form
                onSubmit={handleSaveKey}
                className="flex flex-col gap-4"
            >
                {gamesDisplay && (
                    <p className={cn(
                        "text-sm text-muted-foreground",
                    )}>
                        You moderate:{" "}
                        <strong>{gamesDisplay}</strong>
                    </p>
                )}

                {player.moderation.has_src_key && (
                    <AlertBanner variant="success">
                        You already have an SRC API Key associated. <br />
                        You can replace your key or delete it with the options below.
                    </AlertBanner>
                )}

                <div className="flex flex-col gap-2">
                    <Label htmlFor="src-api-key">
                        {player.moderation.has_src_key
                            ? "Replace API Key"
                            : "SRC API Key"}
                    </Label>
                    <Input
                        id="src-api-key"
                        type="password"
                        value={srcApiKey}
                        onChange={(e) => {
                            setSrcApiKey(e.target.value)
                            setMessage(null)
                        }}
                        placeholder="Paste your API key"
                    />
                    <p className={cn(
                        "text-xs text-muted-foreground",
                    )}>
                        Get your API key from{" "}
                        <a
                            href="https://www.speedrun.com/settings/api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "underline",
                                "hover:text-foreground",
                            )}
                        >
                            speedrun.com/settings/api
                        </a>
                    </p>
                </div>

                {message && (
                    <AlertBanner variant={message.type}>
                        {message.text}
                    </AlertBanner>
                )}

                <div className="flex gap-2">
                    <Button
                        type="submit"
                        disabled={
                            isPending
                            || !srcApiKey.trim()
                        }
                    >
                        {setSrcKey.isPending
                            ? "Saving..."
                            : player.moderation.has_src_key
                                ? "Replace Key"
                                : "Save Key"}
                    </Button>

                    {player.moderation.has_src_key && (
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isPending}
                            onClick={handleRemoveKey}
                        >
                            {deleteSrcKey.isPending
                                ? "Removing..."
                                : "Remove Key"}
                        </Button>
                    )}
                </div>
            </form>
        </Panel>
    )
}
