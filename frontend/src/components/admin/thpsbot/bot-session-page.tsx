import { useBotSession } from "@/hooks/admin/useBotSession"
import { AlertBanner } from "@/components/common/alert-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MetaRow } from "@/components/common/meta-row"
import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/common/query-error-banner"
import { Skeleton } from "@/components/ui/skeleton"
import {
    ToggleGroup, ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
    Loader2, RefreshCw, AlertTriangle,
    CheckCircle2, XCircle,
} from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import type { BotSessionResponse } from "@/types/bot-session"

type OverrideValue = "auto" | "on" | "off"

function overrideToValue(override: boolean | null): OverrideValue {
    if (override === true) return "on"
    if (override === false) return "off"
    return "auto"
}

function valueToOverride(value: OverrideValue): boolean | null {
    if (value === "on") return true
    if (value === "off") return false
    return null
}

function EffectiveBadge({ enabled }: { enabled: boolean }) {
    return enabled ? (
        <Badge variant="default" className="gap-1">
            <CheckCircle2 className="size-3" />
            Enabled
        </Badge>
    ) : (
        <Badge variant="destructive" className="gap-1">
            <XCircle className="size-3" />
            Disabled
        </Badge>
    )
}

function OverrideBadge({
    override,
}: {
    override: boolean | null
}) {
    if (override === null) {
        return <Badge variant="outline">Inherit From Env</Badge>
    }
    if (override) {
        return <Badge variant="default">Force On</Badge>
    }
    return <Badge variant="destructive">Force Off</Badge>
}

function StatusPanel({
    session,
}: {
    session: BotSessionResponse
}) {
    return (
        <Panel className="p-5">
            <h3 className={cn(
                "text-base font-semibold mb-3",
                "flex items-center gap-2",
            )}>
                Session Status
            </h3>
            <div className="space-y-0">
                <MetaRow label="Current State">
                    <EffectiveBadge
                        enabled={session.v2_effective_enabled}
                    />
                </MetaRow>
                <MetaRow label="Status">
                    <span className="capitalize">
                        {session.status || "unknown"}
                    </span>
                </MetaRow>
                <MetaRow label="Last Valid Session">
                    {formatDate(session.validated_at, "Never")}
                </MetaRow>
                <MetaRow label="Last Session Refresh Attempt">
                    {formatDate(
                        session.last_refresh_attempt_at,
                        "Never",
                    )}
                </MetaRow>
                <MetaRow label="Override">
                    <OverrideBadge
                        override={session.v2_enabled_override}
                    />
                </MetaRow>
                <MetaRow label="Circuit Breaker">
                    {session.disabled_by_circuit_breaker ? (
                        <Badge variant="warning">
                            Tripped
                        </Badge>
                    ) : (
                        <Badge variant="outline">OK</Badge>
                    )}
                </MetaRow>
                <MetaRow label="Queued Edits">
                    {session.queued_edit_count}
                </MetaRow>
                <MetaRow label="Failed Edits">
                    {session.failed_edit_count > 0 ? (
                        <span className="text-destructive">
                            {session.failed_edit_count}
                        </span>
                    ) : (
                        session.failed_edit_count
                    )}
                </MetaRow>
                {session.last_severe_error_at && (
                    <MetaRow label="Last Severe Error">
                        {formatDate(
                            session.last_severe_error_at,
                            "Never",
                        )}
                    </MetaRow>
                )}
                {session.last_severe_error_category && (
                    <MetaRow label="Error Category">
                        <span className="font-mono text-xs">
                            {session.last_severe_error_category}
                        </span>
                    </MetaRow>
                )}
            </div>
        </Panel>
    )
}

function ControlsPanel({
    session,
    onRefresh,
    refreshing,
    refreshError,
    onOverride,
    overrideUpdating,
    overrideError,
}: {
    session: BotSessionResponse
    onRefresh: () => void
    refreshing: boolean
    refreshError: Error | null
    onOverride: (value: boolean | null) => void
    overrideUpdating: boolean
    overrideError: Error | null
}) {
    const value = overrideToValue(session.v2_enabled_override)

    return (
        <Panel className="p-5 space-y-5">
            <div>
                <h3 className="text-base font-semibold">
                    Controls
                </h3>
                <p className="text-sm text-muted-foreground">
                    Force a session refresh or change the kill switch override.
                </p>
            </div>

            <div className="space-y-2">
                <span className="text-sm font-medium">
                    Force Refresh
                </span>
                <p className="text-xs text-muted-foreground">
                    Manually triggers a session refresh. This can take ~2 minutes... hopefully.
                </p>
                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="gap-2"
                >
                    {refreshing ? (
                        <Loader2 className={cn(
                            "size-4 animate-spin",
                        )} />
                    ) : (
                        <RefreshCw className="size-4" />
                    )}
                    Refresh session
                </Button>
                {refreshError && (
                    <p className="text-xs text-destructive">
                        {refreshError.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <span className="text-sm font-medium">
                    Bot Override
                </span>
                <p className="text-xs text-muted-foreground">
                    Inherit follows the base environmental default (usually On).
                    "Force On" enables the SRC v2 API regardless of this, with
                    "Force Off" being a kill switch to stop issues. "Force Off" is
                    also invoked when a critical failure occurs in the processes.
                </p>
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={value}
                    disabled={overrideUpdating}
                    onValueChange={(next) => {
                        if (!next || next === value) return
                        onOverride(
                            valueToOverride(
                                next as OverrideValue,
                            ),
                        )
                    }}
                >
                    <ToggleGroupItem value="auto">
                        Inherit
                    </ToggleGroupItem>
                    <ToggleGroupItem value="on">
                        Force On
                    </ToggleGroupItem>
                    <ToggleGroupItem value="off">
                        Force Off
                    </ToggleGroupItem>
                </ToggleGroup>
                {overrideError && (
                    <p className="text-xs text-destructive">
                        {overrideError.message}
                    </p>
                )}
            </div>
        </Panel>
    )
}

function BotSessionSkeletonPanel() {
    return (
        <Panel className="p-5">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center py-2 border-b border-border/30 last:border-b-0"
                    >
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        </Panel>
    )
}

export function BotSessionPage() {
    const {
        data, isLoading, error, refetch,
        refresh, updateKillSwitch,
    } = useBotSession()

    return (
        <div className="space-y-4">
            <Panel>
                <div>
                    <h2 className="text-xl font-semibold">
                        THPSBot Status
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Monitor and manage THPSBot's current session.
                    </p>
                </div>
            </Panel>

            {error && (
                <QueryErrorBanner error={error} onRetry={refetch} />
            )}

            {data?.disabled_by_circuit_breaker && (
                <AlertBanner variant="error">
                    <span className={cn(
                        "flex items-center gap-2",
                    )}>
                        <AlertTriangle className="size-4" />
                        Circuit breaker tripped!! Tasks may still be queued!
                    </span>
                </AlertBanner>
            )}

            {isLoading && (
                <div className={cn(
                    "grid gap-4 md:grid-cols-2",
                )}>
                    <BotSessionSkeletonPanel />
                    <BotSessionSkeletonPanel />
                </div>
            )}

            {data && (
                <div className={cn(
                    "grid gap-4 md:grid-cols-2",
                )}>
                    <StatusPanel session={data} />
                    <ControlsPanel
                        session={data}
                        onRefresh={() => refresh.mutate()}
                        refreshing={refresh.isPending}
                        refreshError={refresh.error}
                        onOverride={(v) =>
                            updateKillSwitch.mutate({
                                override: v,
                            })
                        }
                        overrideUpdating={
                            updateKillSwitch.isPending
                        }
                        overrideError={
                            updateKillSwitch.error
                        }
                    />
                </div>
            )}
        </div>
    )
}
