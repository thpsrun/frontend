import * as React from "react"

import { cn } from "@/lib/utils"

function Panel({ className, children, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="panel"
            className={cn(
                "rounded-lg border border-border/40 bg-background/70 backdrop-blur-sm shadow-sm p-4",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export { Panel }
