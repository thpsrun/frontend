import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("Uncaught error:", error, info)
    }

    handleRetry = (): void => {
        this.setState({ hasError: false })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center gap-4 text-center">
                    <AlertTriangle className="size-8 text-destructive" />
                    <h2 className="text-xl font-semibold">
                        Something went wrong
                    </h2>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        An unexpected error occurred. Try
                        again, or return home. If this keeps
                        happening, contact{" "}
                        <span className="font-medium text-foreground">
                            Anastasia
                        </span>{" "}
                        on the{" "}
                        <span className="font-medium text-foreground">
                            THPS Speedrun Discord
                        </span>.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="default"
                            onClick={this.handleRetry}
                        >
                            Try again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                window.location.href = "/"
                            }}
                        >
                            Return home
                        </Button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
