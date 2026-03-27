import { Component, type ErrorInfo, type ReactNode } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex justify-center pt-12">
                    <Card className="w-full max-w-[500px]">
                        <CardHeader className="flex flex-col items-center gap-3 pb-2">
                            <div className="rounded-full bg-destructive/10 p-3">
                                <AlertTriangle className="size-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">
                                Something went wrong
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                An unexpected error occurred. If this
                                error persists, please contact{" "}
                                <span className="font-medium text-foreground">
                                    Anastasia
                                </span>{" "}
                                on the{" "}
                                <span className="font-medium text-foreground">
                                    THPS Speedrun Discord
                                </span>.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    window.location.href = "/"
                                }}
                            >
                                Return Home
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}
