import { Link } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function OAuthCancelledPage() {
    return (
        <div className="flex justify-center pt-12">
            <Card className="w-full max-w-[400px]">
                <CardHeader>
                    <CardTitle className="text-xl">Login Cancelled</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        You cancelled the login process.
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
