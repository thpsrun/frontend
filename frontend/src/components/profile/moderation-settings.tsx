import { useState } from "react"
import type { UseMutationResult } from "@tanstack/react-query"
import type { AuthPlayer, VerifySrcRequest, SRCKeyStatusResponse } from "@/types/auth"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck } from "lucide-react"

interface ModerationSettingsProps {
    player: AuthPlayer
    setSrcKey: UseMutationResult<SRCKeyStatusResponse, Error, VerifySrcRequest>
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

    const handleSaveKey = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setMessage(null)

        if (!srcApiKey.trim()) return

        try {
            const result = await setSrcKey.mutateAsync({
                src_api_key: srcApiKey,
            })
            setMessage({ type: "success", text: result.message })
            setSrcApiKey("")
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error
                    ? err.message
                    : "Failed to store API key.",
            })
        }
    }

    const handleRemoveKey = async () => {
        setMessage(null)

        try {
            await deleteSrcKey.mutateAsync()
            setMessage({ type: "success", text: "API key removed." })
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error
                    ? err.message
                    : "Failed to remove API key.",
            })
        }
    }

    const gamesDisplay = player.moderated_games
        .map((g) => g.slug.toUpperCase())
        .join(", ")

    const isPending = setSrcKey.isPending || deleteSrcKey.isPending

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="size-5" />
                    Moderation
                </CardTitle>
                <CardDescription>
                    Manage your Speedrun.com API key for run approvals.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={handleSaveKey}
                    className="flex flex-col gap-4"
                >
                    {gamesDisplay && (
                        <p className="text-sm text-muted-foreground">
                            You moderate: <strong>{gamesDisplay}</strong>
                        </p>
                    )}

                    {player.has_src_key && (
                        <div className="rounded-md bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                            You already have an SRC API Key associated. <br />
                            You can replace your key or delete it with the options below.
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="src-api-key">
                            {player.has_src_key
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
                        <p className="text-xs text-muted-foreground">
                            Get your API key from{" "}
                            <a
                                href="https://www.speedrun.com/settings/api"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-foreground"
                            >
                                speedrun.com/settings/api
                            </a>
                        </p>
                    </div>

                    {message && (
                        <div className={`rounded-md px-4 py-3 text-sm ${
                            message.type === "success"
                                ? "bg-success/10 border border-success/20 text-success"
                                : "bg-destructive/10 border border-destructive/20 text-destructive"
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            disabled={isPending || !srcApiKey.trim()}
                        >
                            {setSrcKey.isPending
                                ? "Saving..."
                                : player.has_src_key
                                    ? "Replace Key"
                                    : "Save Key"}
                        </Button>

                        {player.has_src_key && (
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
            </CardContent>
        </Card>
    )
}
