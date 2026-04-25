import { useState } from "react"
import type { UseMutationResult } from "@tanstack/react-query"
import type {
    AuthMe, VerifySrcRequest, SRCKeyStatusResponse,
} from "@/types/auth"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { SaveButton } from "@/components/profile/save-button"
import { SectionPanel } from "@/components/profile/section-panel"
import type { StatusMsg } from "@/types/shared"
import { cn, getErrorMessage } from "@/lib/utils"

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
    const [message, setMessage] = useState<StatusMsg>(null)

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
                text: getErrorMessage(
                    err,
                    "Failed to Store API Key",
                ),
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
                text: getErrorMessage(
                    err,
                    "Failed to Remove API Key",
                ),
            })
        }
    }

    const gamesDisplay = player.moderation.moderated_games
        .map((g) => g.slug.toUpperCase())
        .join(", ")

    const isPending = setSrcKey.isPending
        || deleteSrcKey.isPending

    return (
        <SectionPanel
            title="SRC API Key"
            description="Manage your Speedrun.com API key for run approvals."
        >
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
                    <PasswordInput
                        id="src-api-key"
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
                    <SaveButton
                        isPending={setSrcKey.isPending}
                        disabled={
                            isPending
                            || !srcApiKey.trim()
                        }
                        idleLabel={
                            player.moderation.has_src_key
                                ? "Replace Key"
                                : "Save Key"
                        }
                    />

                    {player.moderation.has_src_key && (
                        <SaveButton
                            type="button"
                            variant="destructive"
                            isPending={deleteSrcKey.isPending}
                            disabled={isPending}
                            onClick={handleRemoveKey}
                            idleLabel="Remove Key"
                            pendingLabel="Removing..."
                        />
                    )}
                </div>
            </form>
        </SectionPanel>
    )
}
