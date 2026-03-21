import { Link } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function OAuthErrorPage() {
    return (
        <div className="flex justify-center pt-12">
            <Card className="w-full max-w-[400px]">
                <CardHeader>
                    <CardTitle className="text-xl">Login Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Something went wrong during login. Please try again.
                    </p>
                    <Link
                        to="/login"
                        className="text-sm text-foreground underline underline-offset-4 hover:text-primary"
                    >
                        Back to login
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
